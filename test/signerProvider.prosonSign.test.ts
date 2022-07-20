import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import {Web3Provider} from "@ethersproject/providers";
import Web3 from "web3";
import {splitSignature} from "@ethersproject/bytes";

const account ='0x32f4B63A46c1D12AD82cABC778D75aBF9889821a'

const wallet ={chainId: 4, privateKeys: secrets.privateKeys}
const signer = new SignerProvider(wallet)

;(async () => {
    const hash = "0x96f8ace777473b81e601cd4dbfce2cb8a0ec2de5ad0e939f7075e5f4707fd805"


    const web3Test = new Web3(signer)
    const sign = await web3Test.eth.sign(hash, account)


    const web3Provider = new Web3Provider(signer)
    const signHash = await web3Provider.send('personal_sign', [
        hash,
        account,
    ])
    // const signHash = await signer.request({method: "eth_sign", params: [account, hash]})
    console.assert(sign == signHash, "eth_sign Hash:signHash")

    console.log(splitSignature(sign))
})()

