import {EventEmitter} from 'events'
import {JsonRpcProvider} from './wallet-connect-provider/jsonRpcProvider'
import {HttpConnection} from './wallet-connect-provider/httpConnection'
import {IEthereumProvider, ProviderAccounts, RequestArguments, WalletInfo} from './types'
import {SIGNING_METHODS} from "./utils/jsonrpc";
import {CHAIN_CONFIG, CHAIN_NAME} from "./utils/chain";
import {arrayify, hexDataSlice, hexZeroPad, joinSignature, splitSignature} from "@ethersproject/bytes";
import {_TypedDataEncoder as TypedDataEncoder} from "@ethersproject/hash";
import {computePublicKey} from "@ethersproject/signing-key";
import {keccak256} from "@ethersproject/keccak256";


import {ec as EC} from "elliptic";


//TypedDataField
export interface EIP712TypedDataField {
    name: string;
    type: string;
};

export interface EIP712Types {
    [key: string]: EIP712TypedDataField[];
}

export interface EIP712Domain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

export type EIP712MessageValue = string | number | unknown[] | EIP712Message;

export interface EIP712Message {
    [key: string]: EIP712MessageValue;
}

export interface EIP712TypedData {
    types: EIP712Types
    domain: EIP712Domain
    message: EIP712Message
    primaryType: string
}


export function privateKeyToAddress(privateKey: string) {
    privateKey = privateKey.substring(0, 2) == '0x' ? privateKey : '0x' + privateKey
    // if (!utils.isHexString(privateKey)) throw new Error("Private key is not hex")
    // return new ethers.Wallet(privateKey).address
    const publicKey = computePublicKey(privateKey)
    return hexDataSlice(keccak256(hexDataSlice(publicKey, 1)), 12)
}

export function privateKeysToAddress(privateKeys: string[]) {
    if (!privateKeys || privateKeys.length == 0) throw new Error("Private keys undefind")
    let accounts = {}
    for (const val of privateKeys) {
        const address = privateKeyToAddress(val).toLowerCase();
        if (!accounts[address]) {
            accounts[address] = val.substring(0, 2) == '0x' ? val : '0x' + val
        }
    }
    return accounts
}

export function ecSignHash(hash: string, privateKey: string): string {
    const curve = new EC("secp256k1");
    const keyPair = curve.keyFromPrivate(arrayify(privateKey));
    const digestBytes = arrayify(hash);
    if (digestBytes.length !== 32) {
        // logger.throwArgumentError("bad digest length", "digest", digest);
    }
    const signature = keyPair.sign(digestBytes, {canonical: true});
    const vrs = splitSignature({
        recoveryParam: signature.recoveryParam,
        r: hexZeroPad("0x" + signature.r.toString(16), 32),
        s: hexZeroPad("0x" + signature.s.toString(16), 32),
    })

    return joinSignature(vrs)
}

/**
 * Compute a complete EIP712 hash given a struct hash.
 */
export function getEIP712Hash(typeData: EIP712TypedData): string {
    const types = JSON.parse(JSON.stringify(typeData.types))
    if (types.EIP712Domain) {
        delete types.EIP712Domain
    }
    return TypedDataEncoder.hash(typeData.domain, types, typeData.message)
}

export class SingerProvider implements IEthereumProvider {
    public events: any = new EventEmitter()
    private http: JsonRpcProvider
    private accounts: string[]
    private accountsPriKey: { [key: string]: string }
    private rpcUrl: string
    private chainId = 1

    constructor(wallet?: Partial<WalletInfo>) {
        let {chainId, privateKeys} = wallet || {}
        privateKeys = privateKeys || []
        this.chainId = chainId || 1
        this.rpcUrl = CHAIN_CONFIG[this.chainId].rpcs[0]
        this.accountsPriKey = privateKeysToAddress(privateKeys)
        this.accounts = Object.keys(this.accountsPriKey)
        this.http = new JsonRpcProvider(new HttpConnection(this.rpcUrl))
    }

    public async request(args: RequestArguments): Promise<any> {
        console.log('request.payload', args.method)
        const {params, method} = args
        switch (args.method) {
            case 'eth_requestAccounts':
                return this.accounts
            case 'eth_accounts':
                return this.accounts
            case 'eth_chainId':
                return this.chainId
            default:
                break
        }
        if (SIGNING_METHODS.some(val => val == method)) {
            // console.log("sendAsync.payload",args.method)
            let hash = ""
            let privateKey = ""
            if (method.substring(0, 17) == "eth_signTypedData") {
                const account = <string>params?.[0]
                privateKey = this.accountsPriKey[account.toLowerCase()]
                // @ts-ignore
                const typeData = JSON.parse(<string>params[1])
                if (typeData.types.EIP712Domain) {
                    delete typeData.types.EIP712Domain
                }
                getEIP712Hash(typeData)
            }
            return ecSignHash(hash, privateKey)
        } else {
            if (typeof this.http === 'undefined') {
                throw new Error(`Cannot request JSON-RPC method (${args.method}) without provided rpc url`)
            }
            return this.http.request(args)
        }
    }

    public async enable(): Promise<ProviderAccounts> {
        const accounts = await this.request({method: 'eth_requestAccounts'})
        return accounts as ProviderAccounts
    }


    public on(event: any, listener: any): void {
        this.events.on(event, listener)
    }

    public once(event: string, listener: any): void {
        this.events.once(event, listener)
    }

    public removeListener(event: string, listener: any): void {
        this.events.removeListener(event, listener)
    }

    public off(event: string, listener: any): void {
        this.events.off(event, listener)
    }

    // ---------- Private ----------------------------------------------- //

    private setHttpProvider(chainId: number): JsonRpcProvider | undefined {
        const rpcUrl = CHAIN_CONFIG[chainId].rpcs[0]
        if (typeof rpcUrl === 'undefined') return undefined
        const http = new JsonRpcProvider(new HttpConnection(rpcUrl))
        return http
    }
}

