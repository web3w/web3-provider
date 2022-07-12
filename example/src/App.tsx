import React, { Component } from "react";

// @ts-ignore
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "web3-qrcode-modal";
import WalletConnectQRCodeModal from "web3-qrcode-modal";
import { convertUtf8ToHex } from "@walletconnect/utils";
import { IInternalEvent, IWalletConnectSession } from "@walletconnect/types";
import Column from "./components/Column";
import Modal from "./components/Modal";
import Header from "./components/Header";
import Loader from "./components/Loader";
import { apiGetAccountAssets, apiGetGasPrices, apiGetAccountNonce } from "./helpers/api";
import {
  sanitizeHex,
  verifySignature,
  hashTypedDataMessage,
  hashPersonalMessage,
} from "./helpers/utilities";
import { convertAmountToRawNumber, convertStringToHex } from "./helpers/bignumber";
import Banner from "./components/Banner";
import AccountAssets from "./components/AccountAssets";
import { eip712 } from "./helpers/eip712";
import {
  IAppState,
  INITIAL_STATE, SBalances,
  SButtonContainer, SConnectButton,
  SContent,
  SKey, SLanding,
  SLayout,
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
} from "./base";

let connector: WalletConnect;

class App extends Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE,
  };

  // public async  componentWillMount() {
  //   console.log("componentWillMount")
  //   const walletConnectSession: string | null = localStorage.getItem("walletconnect");
  //   if (typeof walletConnectSession === "string") {
  //
  //   }
  // }

  public walletConnectInit = async () => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: WalletConnectQRCodeModal,
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete connector
    });

    const { accounts, chainId } = await connector.connect();
    console.log(accounts, chainId);
    if (connector.connected) {
      await this.setState({ connector });
      await this.setState({
        chainId: connector.chainId,
        accounts: connector.accounts,
        address: connector.accounts[0],
      });
      await this.subscribeToEvents();

    } else {
      this.killSession();
    }
  };

  // 链接按钮
  public walletConnectInit_old = async () => {

    const walletSession: string | null = localStorage.getItem("walletconnect");
    if (typeof walletSession === "string") {

      const session: IWalletConnectSession = JSON.parse(walletSession);
      console.log("old connector walletConnectSession", session);
      // // console.log(session)
      connector = new WalletConnect({ session });
      console.log(connector);
      if (connector.connected) {
        await this.setState({ connector });
        await this.setState({
          chainId: connector.chainId,
          accounts: connector.accounts,
          address: connector.accounts[0],
        });
        await this.subscribeToEvents();

      } else {
        this.killSession();
      }
    } else {
      console.log("new connector");
      connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

      await connector.createSession();

      // await this.setState({ connector });
      // await this.setState({ chainId:connector.chainId, accounts:connector.accounts, address:connector.accounts[0] });
      // await this.subscribeToEvents();
    }

    // const callback = ()=>{
    //   // console.log("connector.uri",connector.uri)
    //   console.log("close model callback")
    // }
    // check if already connected
    if (!connector.connected) {
      // console.log("connector.uri 1 ",connector.connected)
      // if(connector.key){
      //   console.log("connector.uri 3 ",connector.uri,"\n key",connector.key)
      //
      //   // QRCodeModal.open(connector.uri,callback)
      // }else {
      //   console.log("connector.createSession pub redis ")
      //   // create new session
      //   await connector.createSession();
      //
      //   console.log("connector.createSession() next ")
      // }
    } else {
      console.log("connector.uri 2 ", connector.uri);
      if (walletSession) {
        // QRCodeModal.open(connector.uri,callback)
      } else {
        alert("new");
      }
    }
  };

  public subscribeToEvents = () => {
    const { connector } = this.state;

    if (!connector) {
      return;
    }

    connector.on("message", async (error: any, payload: any) => {
      console.log(`connector.on("message")`);
    });

    connector.on("session_update", async (error: any, payload: any) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      this.onSessionUpdate(accounts, chainId);
    });

    connector.on("connect", (error: any, payload: any) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      this.onConnect(payload);
    });

    connector.on("disconnect", (error: any, payload: any) => {
      console.log(`connector.on("disconnect")`);

      if (error) {
        throw error;
      }

      this.onDisconnect();
    });

    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      });
      this.onSessionUpdate(accounts, chainId);
    }

    this.setState({ connector });
  };

  public killSession = async () => {

    const { connector } = this.state;
    console.log("killSession for this state");
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  };

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE });
  };

  public onConnect = async (payload: IInternalEvent) => {
    const { chainId, accounts } = payload.params[0];

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
    await this.setState({ chainId, accounts, address });
    await this.getAccountAssets();
  };

  // 获取账户余额
  public getAccountAssets = async () => {
    const { address, chainId } = this.state;
    this.setState({ fetching: true });
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId);
      await this.setState({ fetching: false, address, assets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public toggleModal = () => this.setState({ showModal: !this.state.showModal });

  // ---------  签名交易按钮 --------------
  public testSendTransaction = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    // from
    const from = address;

    // to
    const to = address;

    // nonce
    const _nonce = await apiGetAccountNonce(address, chainId);
    const nonce = sanitizeHex(convertStringToHex(_nonce));

    // gasPrice
    const gasPrices = await apiGetGasPrices();
    const _gasPrice = gasPrices.slow.price;
    const gasPrice = sanitizeHex(convertStringToHex(convertAmountToRawNumber(_gasPrice, 9)));

    // gasLimit
    const _gasLimit = 21000;
    const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));

    // value
    const _value = 0;
    const value = sanitizeHex(convertStringToHex(_value));

    // data
    const data = "0x";

    // test transaction
    const tx = {
      from,
      to,
      nonce,
      gasPrice,
      gasLimit,
      value,
      data,
    };

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // send transaction
      const result = await connector.sendTransaction(tx);

      // format displayed result
      const formattedResult = {
        method: "eth_sendTransaction",
        txHash: result,
        from: address,
        to: address,
        value: "0 ETH",
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  // --------- signPersonalMessage 签名按钮 --------------
  public testSignPersonalMessage = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    // test message
    const message = "My email is john@doe.com - 1537836206101";

    // encode message (hex)
    const hexMsg = convertUtf8ToHex(message);

    // personal_sign params
    const msgParams = [hexMsg, address];

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // send message
      const result = await connector.signPersonalMessage(msgParams);

      // verify signature
      const hash = hashPersonalMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "personal_sign",
        address,
        valid,
        result,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  // --------- signTypedData 签名按钮 --------------
  public testSignTypedData = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    const message = JSON.stringify(eip712.example);

    // eth_signTypedData params
    const msgParams = [address, message];

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // sign typed data
      const result = await connector.signTypedData(msgParams);

      // verify signature
      const hash = hashTypedDataMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "eth_signTypedData",
        address,
        valid,
        result,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
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
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.killSession}
          />
          <SContent>
            {!address && !assets.length ? (
              <SLanding center>
                <h3>
                  {`Try out WalletConnect`}
                  <br/>
                  <span>{`v${process.env.REACT_APP_VERSION}`}</span>
                </h3>
                <SButtonContainer>
                  <SConnectButton left onClick={this.walletConnectInit} fetching={fetching}>
                    {"Connect to WalletConnect"}
                  </SConnectButton>
                </SButtonContainer>
              </SLanding>
            ) : (
              <SBalances>
                <Banner/>
                <h3>Actions</h3>
                <Column center>
                  <STestButtonContainer>
                    <STestButton left onClick={this.testSendTransaction}>
                      {"eth_sendTransaction"}
                    </STestButton>

                    <STestButton left onClick={this.testSignPersonalMessage}>
                      {"personal_sign"}
                    </STestButton>

                    <STestButton left onClick={this.testSignTypedData}>
                      {"eth_signTypedData"}
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
          </SContent>
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
      </SLayout>
    );
  };
}

export default App;
