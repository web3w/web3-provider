import {
    ecSignHash,
    getEIP712DomainHash,
    privateKeysToAddress,
    privateKeyToAddress,
    SignerProvider
} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])

const signer = new SignerProvider({chainId: 4, privateKeys: secrets.privateKeys})

;(async () => {
    const domainHash = getEIP712DomainHash()
    console.log(domainHash)
    const hash = "hello"
    const web3Test = new Web3(signer)
    const sign = await web3Test.eth.sign(hash, account)
    const signHash = await signer.request({method: "eth_sign", params: [account, hash]})
    console.assert(sign == signHash, "eth_sign Hash:signHash")

    const blockNumber =await web3Test.eth.getBlockNumber()

})()

