import {EventEmitter} from 'events'
import {JsonRpcProvider} from './jsonRpcProvider'
import {HttpConnection} from './httpConnection'
import {
    IConnector,
    IRPCMap,
} from '@walletconnect/types'

import {IEthereumProvider, ProviderAccounts, RequestArguments, WalletConnectProviderOptions} from "../types";
import {SignerConnection} from './signerConnection'
import {SIGNING_METHODS} from "../utils/jsonrpc";
import {chainRpcMap} from "../utils/chain";


// https://docs.walletconnect.com/quick-start/dapps/web3-provider
export class WalletConnectProvider implements IEthereumProvider {
    public events: any = new EventEmitter();
    private rpcs: IRPCMap;
    private signer: JsonRpcProvider;
    private http: JsonRpcProvider | undefined;

    constructor(opts?: WalletConnectProviderOptions) {
        const chainId = opts?.chainId || 1
        const bridge = opts?.bridge || "https://bridge.walletconnect.org"
        this.rpcs = opts?.rpcMap || chainRpcMap()

        const signConn = new SignerConnection({...opts, bridge})
        this.signer = new JsonRpcProvider(signConn);
        this.http = this.setHttpProvider(chainId);
        this.registerEventListeners();
    }

    get connected(): boolean {
        return (this.signer.connection as SignerConnection).connected;
    }

    get connector(): IConnector {
        return (this.signer.connection as SignerConnection).connector;
    }

    get accounts(): string[] {
        return (this.signer.connection as SignerConnection).accounts;
    }

    get chainId(): number {
        return (this.signer.connection as SignerConnection).chainId;
    }

    get rpcUrl(): string {
        return (this.http?.connection as HttpConnection).url || "";
    }

    public async request<T = unknown>(args: RequestArguments): Promise<T> {
        switch (args.method) {
            case "eth_requestAccounts":
                await this.connect();
                return (this.signer.connection as any).accounts;
            case "eth_accounts":
                return (this.signer.connection as any).accounts;
            case "eth_chainId":
                return (this.signer.connection as any).chainId;
            default:
                break;
        }
        if (SIGNING_METHODS.some(val => val == args.method)) {
            return this.signer.request(args);
        }
        if (typeof this.http === "undefined") {
            throw new Error(`Cannot request JSON-RPC method (${args.method}) without provided rpc url`);
        }
        return this.http.request(args);
    }

    public async enable(): Promise<ProviderAccounts> {
        const accounts = await this.request({method: "eth_requestAccounts"});
        return accounts as ProviderAccounts;
    }

    public async connect(): Promise<void> {
        if (!this.signer.connection.connected) {
            await this.signer.connect();
        }
    }

    public async disconnect(): Promise<void> {
        if (this.signer.connection.connected) {
            await this.signer.disconnect();
        }
    }

    public on(event: any, listener: any): void {
        this.events.on(event, listener);
    }

    public once(event: string, listener: any): void {
        this.events.once(event, listener);
    }

    public removeListener(event: string, listener: any): void {
        this.events.removeListener(event, listener);
    }

    public off(event: string, listener: any): void {
        this.events.off(event, listener);
    }

    get isWalletConnect() {
        return true;
    }

    // ---------- Private ----------------------------------------------- //

    private registerEventListeners() {
        this.signer.connection.on("accountsChanged", (accounts: string[]) => {
            this.events.emit("accountsChanged", accounts);
        });
        this.signer.connection.on("chainChanged", (chainId: number) => {
            this.http = this.setHttpProvider(chainId);
            this.events.emit("chainChanged", chainId);
        });
        this.signer.on("disconnect", () => {
            this.events.emit("disconnect");
        });
    }

    private setHttpProvider(chainId: number): JsonRpcProvider | undefined {
        const rpcUrl = this.rpcs[chainId];
        if (typeof rpcUrl === "undefined") return undefined;
        const httpConn = new HttpConnection(rpcUrl)
        return new JsonRpcProvider(httpConn);
    }
}

