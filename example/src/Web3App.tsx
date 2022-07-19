import * as React from "react";
import QRCodeModal from "web3-qrcode-modal";
import {convertUtf8ToHex} from "@walletconnect/utils";
import {IInternalEvent} from "@walletconnect/types";
import Column from "./components/Column";

import Modal from "./components/Modal";
import Header from "./components/Header";
import Loader from "./components/Loader";

import {
    sanitizeHex,
    verifySignature,
    hashTypedDataMessage,
    hashMessage,
} from "./helpers/utilities";
import {convertAmountToRawNumber, convertStringToHex} from "./helpers/bignumber";
import Banner from "./components/Banner";
import AccountAssets from "./components/AccountAssets";
import {eip712} from "./helpers/eip712";
import pkg from '../package.json'
import {WalletProvider} from "web3-signer-provider";
import {
    IAppState,
    INITIAL_STATE, SBalances,
    SButtonContainer, SConnectButton,
    SKey, SLanding,
    SModalContainer,
    SModalParagraph,
    SModalTitle,
    SRow,
    STable,
    STestButton,
    STestButtonContainer,
    SValue,
    SContainer,
    bridge,
} from "./helpers/base";

import {Layout} from "antd";
import {apiGetAccountAssets, apiGetAccountNonce, apiGetGasPrices} from "./helpers/api";
import Web3 from "web3";
import {Web3Accounts} from "web3-accounts";

const {Content, Footer} = Layout


export class Web3App extends React.Component<any, any> {

    public state: IAppState = {
        ...INITIAL_STATE,
    };

    public connect = async () => {

        const provider = new WalletProvider({qrcodeModal: QRCodeModal, bridge});

        const web3Signer = new Web3(provider)
        // web3Signer.defaultAccount = provider.address
        // console.log("Web3 Signer", web3Signer)
        await this.setState({provider, web3Signer});

        // check if already connected
        if (!provider.connected) {
            // create new session
            await provider.open();
        }

        // subscribe to events
        await this.subscribeToEvents();
    };
    public subscribeToEvents = () => {
        const {provider} = this.state;

        if (!provider) {
            return;
        }

        provider.on("session_update", async (error, payload) => {
            console.log(`provider.on("session_update")`);

            if (error) {
                throw error;
            }

            const {chainId, accounts} = payload.params[0];
            this.onSessionUpdate(accounts, chainId);
        });

        provider.on("connect", (error, payload) => {
            console.log(`provider.on("connect")`);

            if (error) {
                throw error;
            }

            this.onConnect(payload);
        });

        provider.on("disconnect", (error, payload) => {
            console.log(`provider.on("disconnect")`);

            if (error) {
                throw error;
            }

            this.onDisconnect();
        });

        if (provider.connected) {
            const {chainId, accounts} = provider;
            const address = accounts[0];
            this.setState({
                connected: true,
                chainId,
                accounts,
                address,
            });
            this.onSessionUpdate(accounts, chainId);
        }

        this.setState({provider});
    };

    public killSession = async () => {
        const {provider} = this.state;
        if (provider) {
            provider.close();
        }
        this.resetApp();
    };

    public resetApp = async () => {
        await this.setState({...INITIAL_STATE});
    };

    public onConnect = async (payload: IInternalEvent) => {
        const {chainId, accounts} = payload.params[0];
        const address = accounts[0];
        await this.setState({
            connected: true,
            chainId,
            accounts,
            address,
        });
        this.getAccountAssets();
    };

    public onDisconnect = async () => {
        this.resetApp();
    };

    public onSessionUpdate = async (accounts: string[], chainId: number) => {
        const address = accounts[0];
        await this.setState({chainId, accounts, address});
        await this.getAccountAssets();
    };

    public getAccountAssets = async () => {
        const {address, web3Signer} = this.state;
        this.setState({fetching: true});
        try {
            const asset = {
                symbol: "WETH",
                name: "WETH",
                decimals: "18",
                contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                balance: "1"
            }
            // get account balances
            // const assets: IAssetData[] = [asset]
            // const assets = await apiGetAccountAssets(address, chainId);

            const ethBalance = await web3Signer.eth.getBalance(address);
            const assets = [{
                "symbol": "ETH",
                "name": "Ether",
                "decimals": "18",
                "contractAddress": "",
                "balance": ethBalance.toString()
            }]


            await this.setState({fetching: false, address, assets});
        } catch (error) {
            console.error(error);
            await this.setState({fetching: false});
        }
    };

    public toggleModal = () => this.setState({showModal: !this.state.showModal});

    public testSendTransaction = async () => {
        const {web3Signer, address, provider, chainId} = this.state;

        if (!web3Signer) {
            return;
        }
        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({pendingRequest: true});

            // console.log(provider)
            debugger
            // send transaction
            const result = await web3Signer.eth.sendTransaction({
                from: address,
                to: address,
                value: "1"
            });
            debugger
            // format displayed result
            const formattedResult = {
                method: "eth_sendTransaction",
                txHash: result,
                from: address,
                to: address,
                value: `${1} ETH`,
            };

            // display result
            this.setState({
                web3Signer,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (error) {
            console.error(error);
            this.setState({web3Signer, pendingRequest: false, result: null});
        }
    };

    public testSignTransaction = async () => {
        const {web3Signer, address, provider, chainId} = this.state;

        if (!web3Signer) {
            return;
        }

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({pendingRequest: true});

            // console.log(provider)
            debugger
            // send tra

            // gasPrice: "20000000000",
            //     gas: "21000",
            //     to: '0x3535353535353535353535353535353535353535',
            //     value: "1000000000000000000",
            //     data: ""
            // send transaction
            const result = await web3Signer.eth.signTransaction({
                from: "0xeA199722372dea9DF458dbb56be7721af117a9Bc",
                gasPrice: "20000000000",
                to: address,
                gas: "21000",
                value: "1"
            },(error,data)=>{
                debugger
                console.log(data)

            });
            debugger

            // format displayed result
            const formattedResult = {
                method: "eth_signTransaction",
                from: address,
                to: address,
                value: `${1} ETH`,
                result,
            };

            // display result
            this.setState({
                web3Signer,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (error) {
            console.error(error);
            this.setState({web3Signer, pendingRequest: false, result: null});
        }
    };

    public testLegacySignMessage = async () => {
        const {web3Signer, address, chainId} = this.state;

        if (!web3Signer) {
            return;
        }

        // test message
        const message = `My email is web3wr@gmail.com - ${new Date().toUTCString()}`;

        // hash message
        const hash = hashMessage(message);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({pendingRequest: true});
            const result = await web3Signer.eth.sign(message, address);

            // verify signature
            const valid = await verifySignature(address, result, hash, chainId);

            // format displayed result
            const formattedResult = {
                method: "eth_sign (legacy)",
                address,
                valid,
                result,
            };

            // display result
            this.setState({
                web3Signer,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (error) {
            console.error(error);
            this.setState({web3Signer, pendingRequest: false, result: null});
        }
    };

    public testStandardSignMessage = async () => {
        const {web3Signer, address, chainId} = this.state;

        if (!web3Signer) {
            return;
        }

        // test message
        const message = `My email is web3wr@gmail.com - ${new Date().toUTCString()}`;

        // encode message (hex)
        const hexMsg = convertUtf8ToHex(message);


        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({pendingRequest: true});

            // send message
            const result = await web3Signer.eth.sign(message, address);

            // verify signature
            const hash = hashMessage(message);
            const valid = await verifySignature(address, result, hash, chainId);

            // format displayed result
            const formattedResult = {
                method: "eth_sign (standard)",
                address,
                valid,
                result,
            };

            // display result
            this.setState({
                web3Signer,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (error) {
            console.error(error);
            this.setState({web3Signer, pendingRequest: false, result: null});
        }
    };

    public testPersonalSignMessage = async () => {
        const {  web3Signer, address, chainId} = this.state;

        if (!web3Signer) {
            return;
        }

        // test message
        const message = `My email is web3wr@gmail.com - ${new Date().toUTCString()}`;

        // encode message (hex)
        const hexMsg = convertUtf8ToHex(message);

        // eth_sign params
        const msgParams = [hexMsg, address];

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({pendingRequest: true});
            // send message
            const result = await web3Signer.eth.sign(message, address);

            console.log(result)
            const hash = hashMessage(message);
            console.log(hash)
            debugger
            const valid = await verifySignature(address, result, hash, chainId);
            console.log(valid)

            // format displayed result
            const formattedResult = {
                method: "personal_sign",
                address,
                valid,
                result,
            };

            // display result
            this.setState({
                web3Signer,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (error) {
            debugger
            console.error(error);
            this.setState({web3Signer, pendingRequest: false, result: null});
        }
    };

    public testSignTypedData = async () => {
        const {provider, address, chainId} = this.state;
        const account = new Web3Accounts({address, chainId, provider})


        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({pendingRequest: true});

            // sign typed data
            const result = await account.signTypedData(eip712.example);

            const message = JSON.stringify(eip712.example);
            // verify signature
            const hash = hashTypedDataMessage(message);
            const valid = await verifySignature(address, result.signature, hash, chainId);

            const formattedResult = {
                method: "eth_signTypedData",
                address,
                valid,
                result: result.signature,
            };

            // display result
            this.setState({
                provider,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (error) {
            console.error(error);
            this.setState({provider, pendingRequest: false, result: null});
        }
    };

    public render = () => {
        const {
            assets,
            address,
            connected,
            chainId,
            fetching,
            showModal,
            pendingRequest,
            result,
        } = this.state;
        return (
            <Layout>
                <Column maxWidth={1000} spanHeight>
                    <Header
                        connected={connected}
                        address={address}
                        chainId={chainId}
                        killSession={this.killSession}
                    />
                    <Content>
                        {!address && !assets.length ? (
                            <SLanding center>
                                <h1>
                                    {`Try out Web3 WalletConnect v${pkg.version}`}

                                </h1>
                                <SButtonContainer>
                                    <SConnectButton left onClick={this.connect} fetching={fetching}>
                                        {"Connect to WalletConnect"}
                                    </SConnectButton>

                                </SButtonContainer>
                            </SLanding>
                        ) : (
                            <SBalances>
                                <Banner/>
                                <h3>Web3JS Actions</h3>
                                <Column center>
                                    <STestButtonContainer>
                                        <STestButton left onClick={this.testSendTransaction}>
                                            {"eth_sendTransaction"}
                                        </STestButton>
                                        <STestButton left onClick={this.testSignTransaction}>
                                            {"eth_signTransaction"}
                                        </STestButton>
                                        <STestButton left onClick={this.testSignTypedData}>
                                            {"eth_signTypedData"}
                                        </STestButton>
                                        <STestButton left onClick={this.testLegacySignMessage}>
                                            {"eth_sign (legacy)"}
                                        </STestButton>
                                        <STestButton left onClick={this.testStandardSignMessage}>
                                            {"eth_sign (standard)"}
                                        </STestButton>
                                        <STestButton left onClick={this.testPersonalSignMessage}>
                                            {"personal_sign"}
                                        </STestButton>
                                    </STestButtonContainer>
                                </Column>
                                <h3>Balances</h3>
                                {!fetching ? (
                                    <AccountAssets chainId={chainId} assets={assets}/>
                                ) : (
                                    <Column center>
                                        <SContainer>
                                            <Loader/>
                                        </SContainer>
                                    </Column>
                                )}
                            </SBalances>
                        )}
                    </Content>
                </Column>
                <Modal show={showModal} toggleModal={this.toggleModal}>
                    {pendingRequest ? (
                        <SModalContainer>
                            <SModalTitle>{"Pending Call Request"}</SModalTitle>
                            <SContainer>
                                <Loader/>
                                <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
                            </SContainer>
                        </SModalContainer>
                    ) : result ? (
                        <SModalContainer>
                            <SModalTitle>{"Call Request Approved"}</SModalTitle>
                            <STable>
                                {Object.keys(result).map(key => (
                                    <SRow key={key}>
                                        <SKey>{key}</SKey>
                                        <SValue>{result[key].toString()}</SValue>
                                    </SRow>
                                ))}
                            </STable>
                        </SModalContainer>
                    ) : (
                        <SModalContainer>
                            <SModalTitle>{"Call Request Rejected"}</SModalTitle>
                        </SModalContainer>
                    )}
                </Modal>
            </Layout>
        );
    };
}
