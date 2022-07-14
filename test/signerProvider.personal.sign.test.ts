import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";
import {hashMessage} from "@ethersproject/hash";
import {arrayify, hexlify, hexValue, isHexString} from "@ethersproject/bytes";
import {keccak256} from "@ethersproject/keccak256";
import {toUtf8Bytes,toUtf8String} from "@ethersproject/strings";
import {ethers} from "ethers";

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])

const signer = new SignerProvider({chainId: 4, privateKeys: secrets.privateKeys})
const web3Test = new Web3(signer)
;(async () => {
    const hash = "1"
    // const hash = "0x68656c6c6f"
    if (isHexString(hash)) {
        const arrayHash = toUtf8String(arrayify(hash))
        const hashUtf = web3Test.utils.hexToUtf8(hash)
        // const hashHex1 = hexlify(hash)
    }else {
       // const hashStr =  keccak256(toUtf8Bytes(hash))
       const hashStr =  hexlify(toUtf8Bytes(hash))
        const hashHex = web3Test.utils.toHex(hash)
    }

    const ethersTest = new ethers.providers.Web3Provider(signer)
    const ethSigner =  ethersTest.getSigner()
    const signHash2=await ethSigner.signMessage(hash)


    const hash1 = web3Test.eth.accounts.hashMessage(hash)
    const has2 = hashMessage(hash)

    const signHash0 = web3Test.eth.accounts.sign(hash, secrets.privateKeys[0])
    const signHash = await web3Test.eth.sign(hash, account)



    console.assert(signHash0.signature == signHash, "eth_sign Hash:signHash")

})()

