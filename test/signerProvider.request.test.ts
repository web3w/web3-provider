#! --openssl-legacy-provider
import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";
import { ethers } from "ethers";
import {Wallet} from "@ethersproject/wallet"

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])
//

const signer = new SignerProvider({chainId: 4,privateKeys:secrets.privateKeys,address:"0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"})

;(async () => {

    const web3Test = new Web3(signer)
    const blockNumber =await web3Test.eth.getBlockNumber()
    const block = await web3Test.eth.getBlock(blockNumber)

    const ethersTest = new ethers.providers.Web3Provider(signer)

    const ethSigner = ethersTest.getSigner()




    console.log("nonce",await ethSigner.getTransactionCount())
    debugger
    const blockNumber1=await ethersTest.getBlockNumber()

    const blockHex = "0x" + (blockNumber).toString(16)
    const getBlock = {
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [blockHex, true],
        "id": new Date().getTime()
    }

    const foo = await signer.request(getBlock)
    console.log(foo)


})()

