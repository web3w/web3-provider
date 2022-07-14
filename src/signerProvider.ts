import {EventEmitter} from 'events'
import {
    IEthereumProvider,
    JsonRpcPayload,
    JsonRpcResponse,
    ProviderAccounts,
    RequestArguments,
    RpcInfo,
    WalletInfo
} from './types'
import {getHashMessage, SIGNING_METHODS} from "./utils/rpc";
import {CHAIN_CONFIG, CHAIN_NAME, chainRpcMap} from "./utils/chain";
import {
    arrayify,
    hexDataSlice,
    hexZeroPad,
    joinSignature,
    splitSignature,
    hexlify,
    isHexString
} from "@ethersproject/bytes";
import {_TypedDataEncoder as TypedDataEncoder, hashMessage} from "@ethersproject/hash";
import {computePublicKey} from "@ethersproject/signing-key";
import {keccak256} from "@ethersproject/keccak256";
import {ec as EC} from "elliptic";
import {fetchRPC} from "./utils/rpc";
import {toUtf8String} from "@ethersproject/strings";


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
    // if (!privateKeys || privateKeys.length == 0) throw new Error("Private keys undefind")
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

export class SignerProvider implements IEthereumProvider {
    public events: any = new EventEmitter()
    private accounts: string[]
    private accountsPriKey: { [key: string]: string }
    private rpcInfo: RpcInfo
    private chainId = 1

    constructor(wallet?: Partial<WalletInfo>) {
        this.chainId = wallet?.chainId || 1
        this.rpcInfo = wallet?.rpcUrl || {url: chainRpcMap()[this.chainId]}
        this.accountsPriKey = privateKeysToAddress(wallet?.privateKeys || [])
        this.accounts = Object.keys(this.accountsPriKey)
    }

    public async request(args: RequestArguments): Promise<any> {
        // console.log('request.payload', args.method)
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
            let hash = ""
            let privateKey = ""
            if (method.substring(0, 17) == "eth_signTypedData") {
                if (typeof params?.[0] !== "string" && typeof params?.[1] !== 'string') throw new Error('eth_signTypedData param must string')
                const account = params?.[0]
                privateKey = this.accountsPriKey[account.toLowerCase()]
                const typeData = JSON.parse(params?.[1])
                hash = getEIP712Hash(typeData)
            } else if (method == "personal_sign") {
                const account = <string>params?.[1]
                privateKey = this.accountsPriKey[account.toLowerCase()]
                const msg = <string>params?.[0]
                hash = getHashMessage(msg)
            } else if (method == "eth_sendTransaction") {

            } else if (method == "eth_signTransaction") {

            } else if (method == "eth_sign") {
                const account = <string>params?.[0]
                privateKey = this.accountsPriKey[account.toLowerCase()]
                const msg = <string>params?.[1]
                hash = getHashMessage(msg)
            }
            return ecSignHash(hash, privateKey)
        } else {
            const req = {...args, "jsonrpc": "2.0", "id": new Date().getTime()}
            const res = await fetchRPC(this.rpcInfo, JSON.stringify(req))
            return res.result
        }
    }

    public async sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void) {
        const result = await this.request(payload)
        callback(null, result)
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

}

