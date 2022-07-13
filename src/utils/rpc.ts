import {RpcInfo} from "../types";
import {CHAIN_CONFIG} from "./chain";

export const WALLET_METHODS = [
    "wallet_addEthereumChain",
    "wallet_switchEthereumChain",
    "wallet_getPermissions",
    "wallet_requestPermissions",
    "wallet_registerOnboarding",
    "wallet_watchAsset",
    "wallet_scanQRCode",
];

export const SIGNING_METHODS = [
    "eth_sendTransaction",
    "eth_signTransaction",
    "eth_sign",
    "eth_signTypedData",
    "eth_signTypedData_v1",
    "eth_signTypedData_v2",
    "eth_signTypedData_v3",
    "eth_signTypedData_v4",
    "personal_sign",
    ...WALLET_METHODS,
];

export const STATE_METHODS = ["eth_accounts", "eth_chainId", "net_version"];

export async function fetchRPC(rpc: RpcInfo, body: string) {
    const res = await fetch(rpc.url, {
            method: 'POST',
            body,
            headers: rpc.headers && {'Content-Type': 'application/json'}
        }
    );
    if (res.ok) {
        return res.json();
    } else {
        throw new Error("Fatch Error")
    }
}

const rpcUrl = CHAIN_CONFIG["1"].rpcs[0]

export async function getBlockByNumber(blockNum: number, url?: string) {
    const blockHex = "0x" + blockNum.toString(16)
    const getBlock = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [blockHex, true],
        "id": new Date().getTime()
    }
    return fetchRPC({url: url || rpcUrl}, JSON.stringify(getBlock))
}

export async function getTransactionByHash(txHash: string, url?: string) {
    const getTxByHash = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionByHash",
        "params": [txHash],
        "id": new Date().getTime()
    }
    return fetchRPC({url: url || rpcUrl}, JSON.stringify(getTxByHash))
}

export async function getTransactionReceipt(txHash: string, url?: string) {
    const getReceipt = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionReceipt",
        "params": [txHash],
        "id": new Date().getTime()
    }
    return fetchRPC({url: url || rpcUrl}, JSON.stringify(getReceipt))
}

export function safeJsonParse(value) {
    if (typeof value !== "string") {
        throw new Error(`Cannot safe json parse value of type ${typeof value}`);
    }
    try {
        return JSON.parse(value);
    } catch (_a) {
        return value;
    }
}

export function safeJsonStringify(value) {
    return typeof value === "string" ? value : JSON.stringify(value);
}


export function formatJsonRpcError(id, error, data?) {
    return {
        id,
        jsonrpc: "2.0",
        error: formatErrorMessage(error, data),
    };
}

export function formatErrorMessage(error, data?) {
    if (typeof error === "string") {
        error = Object.assign({}, {message: error});
    }
    if (typeof data !== "undefined") {
        error.data = data;
    }
    return error;
}
