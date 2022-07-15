import styled from "styled-components";
import Wrapper from "../components/Wrapper";
import Column from "../components/Column";
import Button from "../components/Button";
import {fonts} from "./styles";
import {IAssetData} from "./types";
import WalletConnect from "@walletconnect/client";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper as any)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column as any)`
  height: 600px;
`;

const SButtonContainer = styled(Column as any)`
  width: 250px;
  margin: 50px 0;
`;

const SConnectButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  margin: 12px 0;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;

const SModalParagraph = styled.p`
  margin-top: 30px;
`;

// @ts-ignore
const SBalances = styled(SLanding as any)`
  height: 100%;

  & h3 {
    padding-top: 30px;
  }
`;

const STable = styled(SContainer as any)`
  flex-direction: column;
  text-align: left;
`;

const SRow = styled.div`
  width: 100%;
  display: flex;
  margin: 6px 0;
`;

const SKey = styled.div`
  width: 30%;
  font-weight: 700;
`;

const SValue = styled.div`
  width: 70%;
  font-family: monospace;
`;

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const STestButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  max-width: 175px;
  margin: 12px;
`;


const INITIAL_STATE: IAppState = {
    connector: null,
    fetching: false,
    connected: false,
    chainId: 1,
    showModal: false,
    pendingRequest: false,
    uri: "",
    accounts: [],
    address: "",
    result: null,
    assets: [],
    provider: null,
    web3Signer: null,
    ethersSigner: null
};

export {
    SLayout, SContent, SLanding, SButtonContainer, SConnectButton, SContainer,
    STable, SModalContainer, SModalTitle, SModalParagraph, SBalances,
    SRow, SKey, SValue, STestButtonContainer, STestButton, INITIAL_STATE
}


export interface IAppState {
    connector: WalletConnect | null;
    fetching: boolean;
    connected: boolean;
    chainId: number;
    showModal: boolean;
    pendingRequest: boolean;
    uri: string;
    accounts: string[];
    address: string;
    result: any | null;
    assets: IAssetData[];
    provider?: any,
    web3Signer?: any
    ethersSigner?: any
}

export const bridge = "https://bridge.walletconnect.org";
// export const bridge = "https://bridge.element.market"
// export const bridge = "https://api.element.market/bridge/walletconnect"
// export const bridge = "http://10.0.3.22:5001";
