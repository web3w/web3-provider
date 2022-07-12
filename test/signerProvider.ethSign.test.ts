import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])

const signer = new SignerProvider({chainId: 4})

;(async () => {
    const hash = "0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2"
    const signHash0 = ecSignHash(hash, secrets.privateKeys[0])
//     "eth_sign",
    const typedDataStr = JSON.stringify(hash)
    const signHash = await signer.request({method: "eth_sign", params: [account, hash]})
    console.assert(signHash0 == signHash, "eth_sign Hash:signHash")

})()

