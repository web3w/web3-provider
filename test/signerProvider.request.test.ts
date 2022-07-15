import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";
import { ethers } from "ethers";
import {Wallet} from "@ethersproject/wallet"

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])

const ww = ethers.Wallet.createRandom()

console.log(ww.privateKey)

const signer = new SignerProvider({chainId: 4})

;(async () => {

    const web3Test = new Web3(signer)
    const blockNumber =await web3Test.eth.getBlockNumber()
    const block = await web3Test.eth.getBlock(blockNumber)

    const ethersTest = new ethers.providers.Web3Provider(signer)

    const ethSigner = ethersTest.getSigner()

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

