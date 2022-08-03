import * as React from 'react'
import QRCodeModal from 'web3-qrcode-modal'
import { convertUtf8ToHex } from '@walletconnect/utils'
import { IInternalEvent } from '@walletconnect/types'
import Column from './components/Column'

import Modal from './components/Modal'
import Header from './components/Header'
import Loader from './components/Loader'

import {
  verifySignature,
  hashTypedDataMessage,
  hashMessage
} from './helpers/utilities'
import Banner from './components/Banner'
import AccountAssets from './components/AccountAssets'
import { eip712 } from './helpers/eip712'
import pkg from '../package.json'
import { WalletProvider } from 'web3-signer-provider'
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
  bridge
} from './helpers/base'

import { Layout } from 'antd'
import { ethers } from 'ethers'
import { Web3Accounts } from 'web3-accounts'

const { Content } = Layout

export class EthersApp extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE
  }

  public connect = async () => {
    const provider = new WalletProvider({ qrcodeModal: QRCodeModal, bridge })
    if (!provider.connected) {
      await provider.connect()
    }
    // subscribe to events
    await this.subscribeToEvents(provider)
  }
  public subscribeToEvents = (provider) => {
    if (!provider) {
      return
    }

    provider.on('chainChanged', async (error, payload) => {
      console.log(`provider.on("chainChanged")`, payload)
      if (error) {
        throw error
      }
      this.onSessionUpdate(provider)
    })

    provider.on('accountsChanged', async (error, payload) => {
      // setWallet(wallet)
      console.log('wallet_connect accountsChanged Page', payload)
      this.onSessionUpdate(provider)

    })

    provider.on('connect', (error, payload) => {
      if (error) {
        throw error
      }
      this.onConnect(payload)
    })

    provider.on('disconnect', (error, payload) => {
      if (error) {
        throw error
      }
      this.killSession()
    })

    if (provider.connected) {
      const { chainId, accounts } = provider
      const address = accounts[0]
      this.setState({
        connected: true,
        chainId,
        accounts,
        address
      })
      this.onSessionUpdate(provider)
    }
  }

  public killSession = async () => {
    const { provider } = this.state

    if (provider) {
      provider.disconnect()
    }
    this.resetApp()

  }

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE })
  }


  public onSessionUpdate = async (provider) => {
    const ethersSigner = new ethers.providers.Web3Provider(provider).getSigner()
    await this.setState({ provider, ethersSigner })
    await this.getAccountAssets(ethersSigner)
  }

  public getAccountAssets = async (ethersSigner) => {
    // const { address, chainId, ethersSigner } = this.state
    this.setState({ fetching: true })
    try {
      const asset = {
        symbol: 'WETH',
        name: 'WETH',
        decimals: '18',
        contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        balance: '1'
      }
      // get account balances
      // const assets: IAssetData[] = [asset]
      const ethBalance = await ethersSigner.getBalance()
      const assets = [{
        'symbol': 'ETH',
        'name': 'Ether',
        'decimals': '18',
        'contractAddress': '',
        'balance': ethBalance.toString()
      }]

      await this.setState({ fetching: false, assets })
    } catch (error) {
      console.error(error)
      await this.setState({ fetching: false })
    }
  }

  public toggleModal = () => this.setState({ showModal: !this.state.showModal })

  public testSendTransaction = async () => {

    const { ethersSigner, address, chainId } = this.state

    if (!ethersSigner) {
      return
    }

    try {
      // open modal
      this.toggleModal()
      this.setState({ pendingRequest: true })
      const result = await ethersSigner.sendTransaction({ value: '110' })
      const formattedResult = {
        method: 'eth_sendTransaction',
        from: address,
        to: address,
        value: `${110} ETH`,
        result
      }

      this.setState({
        ethersSigner,
        pendingRequest: false,
        result: formattedResult || null
      })
    } catch (error) {
      console.error(error)
      this.setState({ ethersSigner, pendingRequest: false, result: null })
    }
  }

  public testLegacySignMessage = async () => {
    const { ethersSigner, address, chainId } = this.state
    if (!ethersSigner) {
      return
    }
    // test message
    const message = `My email is web3wr@gmail.com ethers.js - ${new Date().toUTCString()}`
    // hash message
    const hash = hashMessage(message)
    try {
      // open modal
      this.toggleModal()
      // toggle pending request indicator
      this.setState({ pendingRequest: true })
      // send message
      const result = await ethersSigner.signMessage(message)

      // verify signature
      const valid = await verifySignature(address, result, hash, chainId)

      // format displayed result
      const formattedResult = {
        method: 'eth_sign (legacy)',
        address,
        valid,
        result
      }

      // display result
      this.setState({
        pendingRequest: false,
        result: formattedResult || null
      })
    } catch (error) {
      console.error(error)
      this.setState({ pendingRequest: false, result: null })
    }
  }

  public testStandardSignMessage = async () => {
    const { address, ethersSigner, chainId } = this.state

    if (!ethersSigner) {
      return
    }

    // test message
    const message = `My email is web3wr@gmail.com ethers.js - ${new Date().toUTCString()}`


    // encode message (hex)
    const hexMsg = convertUtf8ToHex(message)

    try {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      // send message
      const result = await ethersSigner.signMessage(message)

      // verify signature
      const hash = hashMessage(message)
      const valid = await verifySignature(address, result, hash, chainId)

      // format displayed result
      const formattedResult = {
        method: 'eth_sign (standard)',
        address,
        valid,
        result
      }

      // display result
      this.setState({
        ethersSigner,
        pendingRequest: false,
        result: formattedResult || null
      })
    } catch (error) {

      console.error(error)
      this.setState({ ethersSigner, pendingRequest: false, result: null })
    }
  }

  public testPersonalSignMessage = async () => {
    const { address, ethersSigner, chainId } = this.state

    if (!ethersSigner) {
      return
    }

    // test message
    const message = `My email is web3wr@gmail.com ethers.js - ${new Date().toUTCString()}`

    try {
      // open modal
      this.toggleModal()
      // toggle pending request indicator
      this.setState({ pendingRequest: true })
      const result = await ethersSigner.signMessage(message)
      const hash = hashMessage(message)

      const valid = await verifySignature(address, result, hash, chainId)
      console.log(valid)

      // format displayed result
      const formattedResult = {
        method: 'personal_sign',
        address,
        valid,
        result
      }

      // display result
      this.setState({
        ethersSigner,
        pendingRequest: false,
        result: formattedResult || null
      })
    } catch (error) {
      debugger
      console.error(error)
      this.setState({ ethersSigner, pendingRequest: false, result: null })
    }
  }

  public testSignTypedData = async () => {
    const { ethersSigner, address, chainId } = this.state

    if (!ethersSigner) {
      return
    }

    const message = JSON.stringify(eip712.example)


    try {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      const domain = eip712.example.domain
      const types = JSON.parse(JSON.stringify(eip712.example.types))
      const value = eip712.example.message
      delete types.EIP712Domain
      const result = await ethersSigner._signTypedData(domain, types, value)

      // verify signature
      const hash = hashTypedDataMessage(message)
      const valid = await verifySignature(address, result, hash, chainId)

      // format displayed result
      const formattedResult = {
        method: 'eth_signTypedData',
        address,
        valid,
        result
      }

      // display result
      this.setState({
        ethersSigner,
        pendingRequest: false,
        result: formattedResult || null
      })
    } catch (error) {
      console.error(error)
      this.setState({ ethersSigner, pendingRequest: false, result: null })
    }
  }

  public testWethWithdraw = async () => {
    const { address, provider, chainId } = this.state
    const account = new Web3Accounts({ address, chainId, provider })
    const wethBal = await account.wethBalances()
    if (wethBal == '0') {
      return
    } else {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      const result = await account.wethWithdraw(wethBal.substring(5))
      const formattedResult = {
        method: 'WethWithdraw',
        txHash: result.hash,
        from: address,
        to: address,
        value: `${wethBal.substring(5)} ETH`
      }

      // display result
      this.setState({
        provider,
        pendingRequest: false,
        result: formattedResult || null
      })
    }
  }

  public testWethDeposit = async () => {
    const { address, provider, chainId } = this.state
    const account = new Web3Accounts({ address, chainId, provider })
    const ethBal = await account.getGasBalances()
    if (ethBal == '0') {
      alert('ETH balance eq 0')
      return
    } else {
      // open modal
      this.toggleModal()

      // toggle pending request indicator
      this.setState({ pendingRequest: true })

      const result = await account.wethDeposit(ethBal.substring(5), true)
      const formattedResult = {
        method: 'WethDeposit',
        txHash: result.hash,
        from: address,
        to: address,
        value: `${ethBal.substring(5)} ETH`
      }

      // display result
      this.setState({
        provider,
        pendingRequest: false,
        result: formattedResult || null
      })
    }
  }

  public render = () => {
    const {
      assets,
      address,
      connected,
      chainId,
      fetching,
      showModal,
      pendingRequest,
      result
    } = this.state
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
                  {`Try out Ethers WalletProvider for ethers.js v${pkg.version}`}

                </h1>
                <SButtonContainer>
                  <SConnectButton left onClick={this.connect} fetching={fetching}>
                    {'Connect to WalletConnect'}
                  </SConnectButton>
                </SButtonContainer>
              </SLanding>
            ) : (
              <SBalances>
                <Banner />
                <h3>EthersJS Actions</h3>
                <Column center>
                  <STestButtonContainer>
                    <STestButton left onClick={this.testSendTransaction}>
                      {'eth_sendTransaction'}
                    </STestButton>
                    {/*<STestButton left onClick={this.testSendTransaction}>*/}
                    {/*    {"eth_signTransaction"}*/}
                    {/*</STestButton>*/}
                    <STestButton left onClick={this.testSignTypedData}>
                      {'eth_signTypedData'}
                    </STestButton>
                    <STestButton left onClick={this.testLegacySignMessage}>
                      {'eth_sign (legacy)'}
                    </STestButton>
                    <STestButton left onClick={this.testStandardSignMessage}>
                      {'eth_sign (standard)'}
                    </STestButton>
                    <STestButton left onClick={this.testPersonalSignMessage}>
                      {'personal_sign'}
                    </STestButton>

                    <STestButton left onClick={this.testWethWithdraw}>
                      {'weth_withdraw'}
                    </STestButton>

                    <STestButton left onClick={this.testWethDeposit}>
                      {'weth_depoist'}
                    </STestButton>
                  </STestButtonContainer>
                </Column>
                <h3>Balances</h3>
                {!fetching ? (
                  <AccountAssets chainId={chainId} assets={assets} />
                ) : (
                  <Column center>
                    <SContainer>
                      <Loader />
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
              <SModalTitle>{'Pending Call Request'}</SModalTitle>
              <SContainer>
                <Loader />
                <SModalParagraph>{'Approve or reject request using your wallet'}</SModalParagraph>
              </SContainer>
            </SModalContainer>
          ) : result ? (
            <SModalContainer>
              <SModalTitle>{'Call Request Approved'}</SModalTitle>
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
              <SModalTitle>{'Call Request Rejected'}</SModalTitle>
            </SModalContainer>
          )}
        </Modal>
      </Layout>
    )
  }
}
