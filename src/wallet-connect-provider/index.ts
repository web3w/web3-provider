import {EventEmitter} from 'events'

import {
    IEthereumProvider, ProviderAccounts, RequestArguments, IConnector,
    IRPCMap, RpcInfo, WalletConnectProviderOptions
} from "../types";
import {SignerConnection} from './signerConnection'
import {SIGNING_METHODS} from "../utils/rpc";
import {chainRpcMap} from "../utils/chain";
import {fetchRPC} from "../utils/rpc";

// https://docs.walletconnect.com/quick-start/dapps/web3-provider
export class WalletConnectProvider implements IEthereumProvider {
    public events: any = new EventEmitter();
    private rpcs: IRPCMap;
    private signer: SignerConnection;
    private rpcInfo: RpcInfo

    constructor(opts?: WalletConnectProviderOptions) {
        const chainId = opts?.chainId || 1
        const bridge = opts?.bridge || "https://bridge.walletconnect.org"
        this.rpcs = opts?.rpcMap || chainRpcMap()

        // const signConn =
        this.signer = new SignerConnection({...opts, bridge})
        this.rpcInfo = {url: this.rpcs[chainId]}
        this.registerEventListeners();
    }

    get connected(): boolean {
        return this.signer.connected;
    }

    get connector(): IConnector {
        return this.signer.connector;
    }

    get accounts(): string[] {
        return this.signer.accounts;
    }

    get chainId(): number {
        return this.signer.chainId;
    }

    get rpcUrl(): string {
        return this.rpcInfo.url;
    }

    get uri(): string {
        return this.connector.uri;
    }

    public async request(args: RequestArguments): Promise<any> {
        switch (args.method) {
            case "eth_requestAccounts":
                await this.connect();
                return this.accounts;
            case "eth_accounts":
                return this.accounts;
            case "eth_chainId":
                return this.chainId;
            default:
                break;
        }
        if (SIGNING_METHODS.some(val => val == args.method)) {
            return this.signer.send(args);
        }
        // if (typeof this.http === "undefined") {
        //     throw new Error(`Cannot request JSON-RPC method (${args.method}) without provided rpc url`);
        // }
        const req = {...args, "jsonrpc": "2.0", "id": new Date().getTime()}
        return fetchRPC(this.rpcInfo, JSON.stringify(req))
        // return this.http.send(args);
    }

    public async enable(): Promise<ProviderAccounts> {
        const accounts = await this.request({method: "eth_requestAccounts"});
        return accounts as ProviderAccounts;
    }

    public async createSession() {
        await this.connector.createSession();
    }

    public async connect(): Promise<any> {
        if (!this.signer.connected) {
            await this.createSession()
            // await this.signer.connect();
        }
        return {
            chainId: this.chainId,
            accounts: this.accounts,
        };
    }

    public async disconnect(): Promise<void> {
        if (this.signer.connected) {
            // await this.signer.disconnect();
        }
    }

    public async killSession() {
        return this.signer.connector.killSession()
    }

    public on(event: any, listener: any): void {
        this.connector.on(event, listener);
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
        this.signer.on("accountsChanged", (accounts: string[]) => {
            this.events.emit("accountsChanged", accounts);
        });
        this.signer.on("chainChanged", (chainId: number) => {
            this.rpcInfo = {url: this.rpcs[chainId]}
            this.events.emit("chainChanged", chainId);
        });
        this.signer.on("disconnect", () => {
            this.events.emit("disconnect");
        });
    }

}

