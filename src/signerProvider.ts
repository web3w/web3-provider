import { EventEmitter } from 'events'
import {
  EIP1193Provider,
  ProviderAccounts,
  RequestArguments,
  RpcInfo, TransactionRequest,
  WalletInfo
} from './types'
import { getHashMessage, SIGNING_METHODS } from './utils/rpc'
import { chainRpcMap } from './utils/chain'
import {
  arrayify,
  hexDataSlice,
  hexZeroPad,
  joinSignature,
  splitSignature
} from '@ethersproject/bytes'
import { _TypedDataEncoder as TypedDataEncoder, hashMessage, id } from '@ethersproject/hash'
import { computePublicKey } from '@ethersproject/signing-key'
import { Wallet } from '@ethersproject/wallet'
import { keccak256 } from '@ethersproject/keccak256'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ec as EC } from 'elliptic'
import { fetchRPC } from './utils/rpc'

// import { ethers } from 'ethers'


export interface EIP712TypedDataField {
  name: string;
  type: string;
}

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
    const address = privateKeyToAddress(val).toLowerCase()
    if (!accounts[address]) {
      accounts[address] = val.substring(0, 2) == '0x' ? val : '0x' + val
    }
  }
  return accounts
}

export function ecSignHash(hash: string, privateKey: string): string {
  const curve = new EC('secp256k1')
  const keyPair = curve.keyFromPrivate(arrayify(privateKey))
  const digestBytes = arrayify(hash)
  if (digestBytes.length !== 32) {
    // logger.throwArgumentError("bad digest length", "digest", digest);
  }
  const signature = keyPair.sign(digestBytes, { canonical: true })
  const vrs = splitSignature({
    recoveryParam: signature.recoveryParam,
    r: hexZeroPad('0x' + signature.r.toString(16), 32),
    s: hexZeroPad('0x' + signature.s.toString(16), 32)
  })

  return joinSignature(vrs)
}


export function getEIP712DomainHash(): string {
  const primaryType = 'EIP712Domain'
  const types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
  }
  return id(TypedDataEncoder.from(types).encodeType(primaryType))
}

export function getEIP712TypeHash(
  primaryType: string,
  types: EIP712Types = {}) {
  if (types.EIP712Domain) {
    delete types.EIP712Domain
  }
  const typeName = TypedDataEncoder.from(types).encodeType(primaryType)
  return id(typeName)
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

const allowedTransactionKeys: { [key: string]: boolean } = {
  chainId: true, data: true, gasLimit: true, gasPrice: true, nonce: true, to: true, type: true, value: true
}

const prikey = '0x0111111111111111111122222222222222222223333333333333333333311111'

export class SignerProvider implements EIP1193Provider {
  public events: any = new EventEmitter()
  public walletName = 'wallet_signer'
  public accounts: string[]
  public chainId = 1
  private accountsPriKey: { [key: string]: string }
  private rpcInfo: RpcInfo
  public signer: Wallet

  constructor(wallet?: Partial<WalletInfo>) {
    this.chainId = wallet?.chainId || 1
    this.rpcInfo = wallet?.rpcUrl || { url: chainRpcMap()[this.chainId] }
    this.accountsPriKey = privateKeysToAddress(wallet?.privateKeys || [prikey])
    this.accounts = Object.keys(this.accountsPriKey)
    const defaultPriKey = wallet?.address
      ? this.accountsPriKey[wallet?.address.toLowerCase()]
      : prikey
    if (!defaultPriKey) throw new Error('The private key does not match the address')
    this.signer = this.getWallet(defaultPriKey)
  }

  get address() {
    return this.signer.address || this.accounts[0]
  }

  private getWallet(privateKey: string) {
    const wallet = new Wallet(privateKey)
    return wallet.connect(new JsonRpcProvider(this.rpcInfo.url))
  }

  public async request(args: RequestArguments): Promise<any> {
    // console.log('request.payload', args.method)
    const { params, method } = args
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
      let hash = ''
      let privateKey = ''
      if (method.substring(0, 17) == 'eth_signTypedData') {
        if (typeof params?.[0] !== 'string' && typeof params?.[1] !== 'string') throw new Error('eth_signTypedData param must string')
        const account = params?.[0]
        privateKey = this.accountsPriKey[account.toLowerCase()]
        const typeData = JSON.parse(params?.[1])
        hash = getEIP712Hash(typeData)
      } else if (method == 'personal_sign') {
        const account = <string>params?.[1]
        privateKey = this.accountsPriKey[account.toLowerCase()]
        const msg = <string>params?.[0]
        hash = getHashMessage(msg)
      } else if (method == 'eth_sign') {
        const account = <string>params?.[0]
        privateKey = this.accountsPriKey[account.toLowerCase()]
        const msg = <string>params?.[1]
        hash = getHashMessage(msg)
      } else if (method == 'eth_sendTransaction') {
        const tx = await this.signer.sendTransaction(this.parseTxParams(args))
        await tx.wait()
        return tx.hash
      } else if ('eth_signTransaction') {
        const txParams = await this.signer.populateTransaction(this.parseTxParams(args))
        const raw = await this.signer.signTransaction(txParams)
        return {
          raw,
          tx: txParams
        }
      }
      // else if ("eth_sendRawTransaction") {
      //     // @ts-ignore
      //     const txRaw = <string>params?.[0]
      //     const receipt = await this.signer.provider.sendTransaction(txRaw);
      //     return receipt.hash;
      // }
      return ecSignHash(hash, privateKey)
    } else {
      const req = { ...args, 'jsonrpc': '2.0', 'id': new Date().getTime() }
      const res = await fetchRPC(this.rpcInfo, JSON.stringify(req))
      return res.result
    }
  }

  // public send(method: string,
  //                   params?: unknown[] | object) {
  //     return this.request({
  //         method,
  //         params
  //     })
  // }

  // send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void)

  public sendAsync(
    args: RequestArguments,
    callback: (error: Error | null, response: any) => void
  ): void {
    this.request(args)
      .then(response => callback(null, response))
      .catch(error => callback(error, undefined))
  }

  public async connect(): Promise<ProviderAccounts> {
    const accounts = await this.request({ method: 'eth_requestAccounts' })
    return accounts as ProviderAccounts
  }

  public async disconnect(): Promise<void> {

  }

  public async signMessage(message: string): Promise<string> {
    return this.request({
      'method': 'personal_sign',
      params: [message, this.address]
    })
  }

  public async signTypedData(typedData: EIP712TypedData) {
    return this.request({
      'method': 'eth_signTypedData',
      params: [this.address, typedData]
    })
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

  private parseTxParams = payload => {
    let txParams: TransactionRequest = {
      from: payload.params[0].from,
      data: payload.params[0].data,
      chainId: this.chainId
    }
    if (payload.params[0].gas) {
      txParams = {
        ...txParams,
        gasLimit: payload.params[0].gas
      }
    }
    if (payload.params[0].to) {
      txParams = {
        ...txParams,
        to: payload.params[0].to
      }
    }
    return txParams
  }
}

