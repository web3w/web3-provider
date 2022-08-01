import * as React from "react";
import QRCodeModal from "web3-qrcode-modal";
import {IInternalEvent} from "@walletconnect/types";
import Column from "./components/Column";

import pkg from '../package.json'
import {WalletProvider} from "web3-signer-provider";
import {
    INITIAL_STATE, SBalances,
    SButtonContainer, SConnectButton,
    SKey, SLanding,
    bridge,
} from "./helpers/base";

import {Layout} from "antd";
import Web3 from "web3";
import {Web3App} from "./Web3App";
import {WalletApp} from "./WalletApp";
import {EthersApp} from "./EthersApp";

const {Content, Footer} = Layout


export class App extends React.Component<any, any> {

    constructor(props) {
        super(props);
        // this.Web3App = React.createRef();
    }

    public state = {
        fetching: false,
        clientType: "select",
    };

    handleOnClick(type) {
        if (type == "web3") {
            this.setState({clientType: type})
        }

        if (type == "ethers") {
            this.setState({clientType: type})
        }

        if (type == "walletconnect") {
            this.setState({clientType: type})
        }

    }

    // public connect = async () => {
    //     const provider = new WalletProvider({qrcodeModal: QRCodeModal, bridge});
    //     const connector = provider.connector
    //     const web3Signer = new Web3(provider)
    //     await this.setState({connector, web3Signer});
    //
    //     // check if already connected
    //     if (!connector.connected) {
    //         // create new session
    //         await connector.createSession();
    //     }
    //
    //     // subscribe to events
    //     await this.subscribeToEvents();
    // };
    // public subscribeToEvents = () => {
    //     const {connector} = this.state;
    //
    //     if (!connector) {
    //         return;
    //     }
    //
    //     connector.on("session_update", async (error, payload) => {
    //         console.log(`connector.on("session_update")`);
    //
    //         if (error) {
    //             throw error;
    //         }
    //
    //         const {chainId, accounts} = payload.params[0];
    //         this.onSessionUpdate(accounts, chainId);
    //     });
    //
    //     connector.on("connect", (error, payload) => {
    //         console.log(`connector.on("connect")`);
    //
    //         if (error) {
    //             throw error;
    //         }
    //
    //         this.onConnect(payload);
    //     });
    //
    //     connector.on("disconnect", (error, payload) => {
    //         console.log(`connector.on("disconnect")`);
    //
    //         if (error) {
    //             throw error;
    //         }
    //
    //         this.onDisconnect();
    //     });
    //
    //     if (connector.connected) {
    //         const {chainId, accounts} = connector;
    //         const address = accounts[0];
    //         this.setState({
    //             connected: true,
    //             chainId,
    //             accounts,
    //             address,
    //         });
    //         this.onSessionUpdate(accounts, chainId);
    //     }
    //
    //     this.setState({connector});
    // };

    // public killSession = async () => {
    //     const {connector} = this.state;
    //     if (connector) {
    //         connector.killSession();
    //     }
    //     this.resetApp();
    // };

    // public resetApp = async () => {
    //     await this.setState({...INITIAL_STATE});
    // };
    //
    // public onConnect = async (payload: IInternalEvent) => {
    //     const {chainId, accounts} = payload.params[0];
    //     const address = accounts[0];
    //     await this.setState({
    //         connected: true,
    //         chainId,
    //         accounts,
    //         address,
    //     });
    //     this.getAccountAssets();
    // };

    // public onDisconnect = async () => {
    //     this.resetApp();
    // };
    //
    // public onSessionUpdate = async (accounts: string[], chainId: number) => {
    //     const address = accounts[0];
    //     await this.setState({chainId, accounts, address});
    //     await this.getAccountAssets();
    // };

    public render = () => {
        const {
            fetching,
            clientType
        } = this.state;
        return (
            <Layout>
                <Column maxWidth={1000} spanHeight>
                    {clientType == "select" && <Content>
                        <SLanding center>
                            <h1>
                                {`Try out WalletConnect v${pkg.version}`}
                            </h1>
                            <SButtonContainer>
                                <SConnectButton left onClick={() => this.handleOnClick('web3')} fetching={fetching}>
                                    {"WalletConnect Web3"}
                                </SConnectButton>

                                <SConnectButton left onClick={() => this.handleOnClick('ethers')} fetching={fetching}>
                                    {"WalletConnect Ethers"}
                                </SConnectButton>

                                <SConnectButton left onClick={() => this.handleOnClick('walletconnect')}
                                                fetching={fetching}>
                                    {"Connect to WalletConnect"}
                                </SConnectButton>
                            </SButtonContainer>
                        </SLanding>
                    </Content>}
                    {clientType == "web3" && <Web3App/>}
                    {clientType == "ethers" && <EthersApp/>}
                    {clientType == "walletconnect" && <WalletApp/>}
                </Column>
            </Layout>
        );
    };
}
