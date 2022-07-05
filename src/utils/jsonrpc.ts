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
