import * as React from 'react'
import QRCodeModal from 'web3-qrcode-modal'
import { IInternalEvent } from '@walletconnect/types'
import Column from './components/Column'

import pkg from '../package.json'
import { WalletProvider } from 'web3-signer-provider'
import {
  INITIAL_STATE, SBalances,
  SButtonContainer, SConnectButton,
  SKey, SLanding,
  bridge
} from './helpers/base'

import { Layout } from 'antd'
import { Web3App } from './Web3App'
import { WalletApp } from './WalletApp'
import { EthersApp } from './EthersApp'

const { Content, Footer } = Layout


export class App extends React.Component<any, any> {

  constructor(props) {
    super(props)
    // this.Web3App = React.createRef();
  }

  public state = {
    fetching: false,
    clientType: 'select'
  }

  handleOnClick(type) {
    if (type == 'web3') {
      this.setState({ clientType: type })
    }

    if (type == 'ethers') {
      this.setState({ clientType: type })
    }

    if (type == 'walletconnect') {
      this.setState({ clientType: type })
    }

  }


  public render = () => {
    const {
      fetching,
      clientType
    } = this.state
    return (
      <Layout>
        <Column maxWidth={1000} spanHeight>
          {clientType == 'select' && <Content>
            <SLanding center>
              <h1>
                {`Try out WalletConnect v${pkg.version}`}
              </h1>
              <SButtonContainer>
                <SConnectButton left onClick={() => this.handleOnClick('web3')} fetching={fetching}>
                  {'WalletConnect Web3@v1.7.5'}
                </SConnectButton>

                <SConnectButton left onClick={() => this.handleOnClick('ethers')} fetching={fetching}>
                  {'WalletConnect Ethers@v5.6.9'}
                </SConnectButton>

                <SConnectButton left onClick={() => this.handleOnClick('walletconnect')}
                                fetching={fetching}>
                  {'Connect to WalletConnect'}
                </SConnectButton>
              </SButtonContainer>
            </SLanding>
          </Content>}
          {clientType == 'web3' && <Web3App />}
          {clientType == 'ethers' && <EthersApp />}
          {clientType == 'walletconnect' && <WalletApp />}
        </Column>
      </Layout>
    )
  }
}
