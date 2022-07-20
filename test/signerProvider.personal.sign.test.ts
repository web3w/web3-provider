import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";
import {hashMessage} from "@ethersproject/hash";
import {arrayify, hexlify, hexValue, isHexString} from "@ethersproject/bytes";
import {keccak256} from "@ethersproject/keccak256";
import {toUtf8Bytes,toUtf8String} from "@ethersproject/strings";
import {ethers} from "ethers";

const accounts = privateKeysToAddress(secrets.privateKeys)
const account ='0x32f4B63A46c1D12AD82cABC778D75aBF9889821a'

const signer = new SignerProvider({chainId: 4, privateKeys: secrets.privateKeys})
const web3Test = new Web3(signer)
;(async () => {
    const hash = "0x96f8ace777473b81e601cd4dbfce2cb8a0ec2de5ad0e939f7075e5f4707fd805"
    // const hash = "0x68656c6c6f"
    if (isHexString(hash)) {
        // const arrayHash = toUtf8String(arrayify(hash))
        // const hashUtf = web3Test.utils.hexToUtf8(hash)
        // const hashHex1 = hexlify(hash)
    }else {
       // const hashStr =  keccak256(toUtf8Bytes(hash))

       // const hashStr =  hexlify(toUtf8Bytes(hash))
       //  const hashHex = web3Test.utils.toHex(hash)
    }

    const ethersTest = new ethers.providers.Web3Provider(signer)
    const ethSigner =  ethersTest.getSigner()
    const signHash2=await ethSigner.signMessage(hash)


    // const hash1 = web3Test.eth.accounts.hashMessage(hash)
    // const has2 = hashMessage(hash)

    const signHash0 = web3Test.eth.accounts.sign(hash, secrets.privateKeys[0])
    const signHash = await web3Test.eth.sign(hash, account)



    console.assert(signHash0.signature == signHash2, "eth_sign Hash:signHash")

})()

