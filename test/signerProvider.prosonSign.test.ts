import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import {Web3Provider} from "@ethersproject/providers";
import Web3 from "web3";

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])

const signer = new SignerProvider({chainId: 4, privateKeys: secrets.privateKeys})

;(async () => {
    const hash = "0x0a56a97fdd2cbc0baace77dcccf86143eeb8f1aaf23af3337f7adc17a56bdfe8"


    const web3Test = new Web3(signer)
    const sign = await web3Test.eth.sign(hash, account)


    const web3Provider = new Web3Provider(signer)
    const signHash = await web3Provider.send('personal_sign', [
        hash,
        account,
    ])
    // const signHash = await signer.request({method: "eth_sign", params: [account, hash]})
    console.assert(sign == signHash, "eth_sign Hash:signHash")


})()

