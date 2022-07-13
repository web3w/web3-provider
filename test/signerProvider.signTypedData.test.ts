import {ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider} from "../src/signerProvider";
import secrets from '../../../secrets.json'

const typedData = {
    types: {
        EIP712Domain: [
            {name: 'name', type: 'string'},
            {name: 'version', type: 'string'},
            {name: 'chainId', type: 'uint256'},
            {name: 'verifyingContract', type: 'address'}
        ],
        Person: [
            {name: 'name', type: 'string'},
            {name: 'wallet', type: 'address'}
        ],
        Mail: [
            {name: 'from', type: 'Person'},
            {name: 'to', type: 'Person'},
            {name: 'contents', type: 'string'}
        ]
    },
    primaryType: 'Mail',
    domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    },
    message: {
        from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
        },
        to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
        },
        contents: 'Hello, Bob!'
    }
}

const accounts = privateKeysToAddress(secrets.privateKeys)
const account = privateKeyToAddress(secrets.privateKeys[0])

const signer = new SignerProvider({privateKeys: secrets.privateKeys})

;(async () => {
    const hash = "0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2"
    const signHash0 = ecSignHash(hash, secrets.privateKeys[0])
//     "eth_sign",
//     "eth_signTypedData",
//     "eth_signTypedData_v1",
//     "eth_signTypedData_v2",
//     "eth_signTypedData_v3",
//     "eth_signTypedData_v4",
    const typedDataStr = JSON.stringify(typedData)
    const signHash = await signer.request({method: "eth_signTypedData", params: [account, typedDataStr]})
    console.assert(signHash0 == signHash, "Sign Hash:signHash")
    const signHashv1 = await signer.request({method: "eth_signTypedData_v1", params: [account, typedDataStr]})
    console.assert(signHash0 == signHashv1, "Sign Hash: signHashv1")
    const signHashv2 = await signer.request({method: "eth_signTypedData_v2", params: [account, typedDataStr]})
    console.assert(signHash0 == signHashv2, "Sign Hash: signHashv2")
    const signHashv3 = await signer.request({method: "eth_signTypedData_v3", params: [account, typedDataStr]})
    console.assert(signHash0 == signHashv3, "Sign Hash: signHashv3")
    const signHashv4 = await signer.request({method: "eth_signTypedData_v4", params: [account, typedDataStr]})
    console.assert(signHash0 == signHashv4, "Sign Hash: signHashv4")

})()

