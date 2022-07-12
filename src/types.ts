// import WalletConnectClient from "@walletconnect/client";
// import QRCodeModal from "web3-qrcode-modal";
import {IConnector} from "@walletconnect/types";

export type {JsonRpcError, JsonRpcResponse} from "@walletconnect/jsonrpc-types";
export {formatJsonRpcError} from "@walletconnect/jsonrpc-utils";

export type {IConnector}

export interface IClientMeta {
    description: string;
    url: string;
    icons: string[];
    name: string;
}

export interface IRPCMap {
    [chainId: number]: string;
}

export interface IQRCodeModal {
    open(uri: string, cb: any, opts?: any): void;

    close(): void;
}

export interface BridgeOptions {
    bridge: string;
    connector?: IConnector;
    qrcode?: IQRCodeModal;
    chainId?: number;
    storageId?: string;
    signingMethods?: string[];
    clientMeta?: IClientMeta;
}

export interface WalletConnectProviderOptions extends BridgeOptions {
    rpcMap: IRPCMap;
}

// export {WalletConnectClient} //QRCodeModal

export interface ProviderRpcError extends Error {
    message: string;
    code: number;
    data?: unknown;
}

export interface ProviderMessage {
    type: string;
    data: unknown;
}

export interface ProviderInfo {
    chainId: string;
}

export interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

export type ProviderChainId = string;

export interface ProviderConnectInfo {
    readonly chainId: string
}

export type  ProviderAccounts = string[];

export interface EIP1102Request extends RequestArguments {
    method: "eth_requestAccounts";
}

export interface SimpleEventEmitter {
    // add listener
    on(event: string, listener: any): void;

    // add one-time listener
    once(event: string, listener: any): void;

    // remove listener
    removeListener(event: string, listener: any): void;

    // removeListener alias
    off(event: string, listener: any): void;
}

export interface EIP1193Provider extends SimpleEventEmitter {
    // connection event
    on(event: "connect", listener: (info: ProviderInfo) => void): void;

    // disconnection event
    on(event: "disconnect", listener: (error: ProviderRpcError) => void): void;

    // arbitrary messages
    on(event: "message", listener: (message: ProviderMessage) => void): void;

    // chain changed event
    on(event: "chainChanged", listener: (chainId: ProviderChainId) => void): void;

    // accounts changed event
    on(
        event: "accountsChanged",
        listener: (accounts: ProviderAccounts) => void
    ): void;

    // make an Ethereum RPC method call.
    request(args: RequestArguments): Promise<unknown>;
}

export interface IEthereumProvider extends EIP1193Provider {
    // legacy alias for EIP-1102
    enable(): Promise<ProviderAccounts>;
}


export interface ChainConfig {
    rpcs: string []
    faucets?: string []
    scans?: string []
    name?: string
    websiteUrl?: string
    websiteDead?: boolean
    rpcWorking?: boolean
}

export type JsonRpcId = string | number
export type JsonRpcParams<T> = T[] | Record<string, T>

export interface JsonRpcRequest<T> {
    jsonrpc: '2.0'
    id: JsonRpcId
    method: string
    params: JsonRpcParams<T>
}

