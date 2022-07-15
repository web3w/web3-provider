import {EventEmitter} from 'events'
import WalletConnect from "@walletconnect/client";
import {
    BridgeOptions, IConnector,
    JsonRpcResponse,
    JsonRpcError,
    IJsonRpcResponseError,
    IJsonRpcResponseSuccess, IRPCMap, RpcInfo, RequestArguments, ProviderAccounts, JsonRpcPayload
} from "./types";
import {fetchRPC, formatJsonRpcError, getHashMessage, SIGNING_METHODS} from "./utils/rpc";
import {chainRpcMap} from "./utils/chain";
import {getEIP712Hash} from "./signerProvider";

export class WalletProvider {
    public events: any = new EventEmitter();
    public accounts: string[] = [];
    public chainId = 1;


    private pending = false;
    private wc: IConnector | undefined;
    private bridge: string;
    private opts: BridgeOptions;
    private rpcs: IRPCMap;
    private rpcInfo: RpcInfo

    constructor(opts: BridgeOptions, rpcMap?: IRPCMap) {
        this.opts = opts;
        this.bridge = opts?.bridge || "https://bridge.walletconnect.org"
        this.chainId = opts?.chainId || this.chainId;
        this.wc = this.register(opts);
        this.rpcs = rpcMap || chainRpcMap()
        this.rpcInfo = {url: this.rpcs[this.chainId]}
    }

    public async request(args: RequestArguments): Promise<any> {
        switch (args.method) {
            case "eth_requestAccounts":
                return this.accounts;
            case "eth_accounts":
                return this.accounts;
            case "eth_chainId":
                return this.chainId;
            default:
                break;
        }
        if (SIGNING_METHODS.some(val => val == args.method)) {
            return this.send(args)
        } else {
            const req = {...args, "jsonrpc": "2.0", "id": new Date().getTime()}
            const res = await fetchRPC(this.rpcInfo, JSON.stringify(req))
            if (res.result) {
                return res.result
            } else {
                throw  res.error
            }
        }
    }

    public sendAsync<T = unknown>(
        args: RequestArguments,
        callback: (error: Error | null, response: any) => void
    ): void {
        this.request(args)
            .then(response => callback(null, response))
            .catch(error => callback(error, null));
    }

    public send(args: any) {
        this.wc = this.register(this.opts);
        return new Promise(async (resolve, reject) => {
            if (!this.connected) await this.open();
            if (!this.wc) reject("Wallet connect undefined")
            let result
            const {method, params} = args
            if (method.substring(0, 17) == "eth_signTypedData") {
                if (typeof params?.[0] !== "string" && typeof params?.[1] !== 'string') throw new Error('eth_signTypedData param must string')
                result = await this.wc?.signTypedData(params)
            } else if (method == "personal_sign") {
                result = await this.wc?.signPersonalMessage(params)
            } else if (method == "eth_sign") {
                result = await this.wc?.signMessage(params)
            } else if ("eth_signTransaction") {
                result = await this.wc?.signTransaction(params)
            } else if (method == "eth_sendTransaction") {
                result = await this.wc?.sendTransaction(params)
            } else {
                reject(args)
            }

            resolve(result)

        })
    }

    public async enable(): Promise<ProviderAccounts> {
        const accounts = await this.request({method: "eth_requestAccounts"});
        return accounts as ProviderAccounts;
    }

    get connected(): boolean {
        return typeof this.wc !== "undefined" && this.wc.connected;
    }

    get connecting(): boolean {
        return this.pending;
    }

    get connector(): IConnector {
        this.wc = this.register(this.opts);
        return this.wc;
    }

    public on(event: string, listener: any) {
        this.events.on(event, listener);
    }

    public once(event: string, listener: any) {
        this.events.once(event, listener);
    }

    public off(event: string, listener: any) {
        this.events.off(event, listener);
    }

    public removeListener(event: string, listener: any) {
        this.events.removeListener(event, listener);
    }

    public async open(chainId?: number): Promise<void> {
        if (this.connected) {
            this.onOpen();
            return;
        }
        return new Promise((resolve, reject): void => {
            this.on("error", err => {
                reject(err);
            });

            this.on("open", () => {
                resolve();
            });

            this.create(chainId);
        });
    }

    public async close(): Promise<void> {
        if (typeof this.wc === "undefined") return;
        if (this.wc.connected) {
            this.wc.killSession();
        }
        this.onClose();
    }


    // ---------- Private ----------------------------------------------- //

    private register(opts: BridgeOptions): IConnector {
        if (this.wc) return this.wc;
        this.opts = opts || this.opts;
        this.bridge = opts?.connector ? opts.connector.bridge : opts.bridge || ""
        // this.qrcode = typeof opts?.qrcode === "undefined" || opts?.qrcode !== false;
        this.chainId = opts?.chainId || this.chainId;
        const connectorOpts = {
            bridge: this.bridge,
            qrcodeModal: opts?.qrcode,
            storageId: opts?.storageId,
            signingMethods: opts?.signingMethods,
            clientMeta: opts?.clientMeta,
        };
        this.wc = typeof opts?.connector !== "undefined" ? opts.connector : new WalletConnect(connectorOpts);
        if (typeof this.wc === "undefined") {
            throw new Error("Failed to register WalletConnect connector");
        }
        if (this.wc.accounts.length) {
            this.accounts = this.wc.accounts;
        }
        if (this.wc.chainId) {
            this.chainId = this.wc.chainId;
        }
        // this.accounts = this.wc.accounts;
        // this.chainId = this.wc.chainId;
        this.registerConnectorEvents();
        return this.wc;
    }

    private onOpen(wc?: IConnector) {
        this.pending = false;
        if (wc) {
            this.wc = wc;
        }
        this.events.emit("open");
    }

    private onClose() {
        this.pending = false;
        if (this.wc) {
            this.wc = undefined;
        }
        this.events.emit("close");
    }

    public onError(
        payload: any,
        message = "Failed or Rejected Request",
        code = -32000,
    ): JsonRpcError {
        const errorPayload = {
            id: payload.id,
            jsonrpc: payload.jsonrpc,
            error: {code, message},
        };
        this.events.emit("payload", errorPayload);
        return errorPayload;
    }

    private create(chainId?: number): void {
        this.wc = this.register(this.opts);
        this.chainId = chainId || this.chainId;
        if (this.connected || this.pending) return;
        this.pending = true;
        this.registerConnectorEvents();
        this.wc
            .createSession({chainId: this.chainId})
            .then(() => this.events.emit("created"))
            .catch((e: Error) => this.events.emit("error", e));
    }

    private registerConnectorEvents() {
        this.wc = this.register(this.opts);

        this.wc.on("connect", (err: Error | null) => {
            // console.log("wc connect")
            if (err) {
                this.events.emit("error", err);
                return;
            }
            this.accounts = this.wc?.accounts || [];
            this.chainId = this.wc?.chainId || this.chainId;

            this.onOpen();
        });

        this.wc.on("disconnect", (err: Error | null) => {
            if (err) {
                this.events.emit("error", err);
                return;
            }

            this.onClose();
        });

        this.wc.on("modal_closed", () => {
            this.events.emit("error", new Error("User closed modal"));
        });

        this.wc.on("session_update", (error, payload) => {
            const {accounts, chainId} = payload.params[0];
            if (!this.accounts || (accounts && this.accounts !== accounts)) {
                this.accounts = accounts;
                this.events.emit("accountsChanged", accounts);
            }
            if (!this.chainId || (chainId && this.chainId !== chainId)) {
                this.chainId = chainId;
                this.events.emit("chainChanged", chainId);
            }
        });
    }

    // private async sendPayload(payload: any): Promise<JsonRpcResponse> {
    //     this.wc = this.register(this.opts);
    //     try {
    //         const response = await this.wc.unsafeSend(payload);
    //         return this.sanitizeResponse(response);
    //     } catch (error) {
    //         return this.onError(payload, (error as any).message);
    //     }
    // }

    // private sanitizeResponse(
    //     response: IJsonRpcResponseSuccess | IJsonRpcResponseError,
    // ): JsonRpcResponse {
    //     return typeof (response as IJsonRpcResponseError).error !== "undefined" &&
    //     typeof (response as IJsonRpcResponseError).error.code === "undefined"
    //         ? formatJsonRpcError(response.id, (response as IJsonRpcResponseError).error.message)
    //         : (response as JsonRpcResponse);
    // }
}

