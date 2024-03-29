// import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";
import {privateKeyToAddress, SignerProvider} from "../src/signerProvider";

import {WalletProvider} from "../src/walletProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";
import {ethers} from "ethers";

const account = privateKeyToAddress(secrets.privateKeys[0])
const signer = new SignerProvider({chainId: 4, privateKeys: secrets.privateKeys})

const tx = {
        "from": account,
        "to": "0x32f4B63A46c1D12AD82cABC778D75aBF9889821a",
        "gasPrice": "0x0649534e00",
        "gasLimit": "0x5208",
        "value": "0x00",
        "data": "0x"
    }

// const ff =  await signer.request({
//         method:"eth_sendTransaction",
//         params:[{
//             "chainId": "0x4",
//             "gas": "0x5208",
//             "type": "0x2",
//             "maxFeePerGas": "0x649534e00",
//             "maxPriorityFeePerGas": "0x649534e00",
//             "nonce": "0x0",
//             "value": "0x0",
//             "from": "0x9f7a946d935c8efc7a8329c0d894a69ba241345a",
//             "to": "0x32f4b63a46c1d12ad82cabc778d75abf9889821a",
//             "data": "0x"
//         }]
//     })

;(async () => {

    const account = "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"
    const bridge = "https://bridge.walletconnect.org"
    // Create a connector
    const provider = new WalletProvider({
        chainId: 4,
        bridge, // Requireda
    });

    // new WalletProvider({bridge, chainId});


    const pageClient = provider.connector
    //createSession 生产 uri
    await pageClient.createSession();


    pageClient.on("connect", async (val, e) => {
        // console.log("connect1", val, e)
        console.log("1.3 PageClient connect ", pageClient.connected, "SignMessage")

        console.log("2.1 PageClient SignMessage")
        const message = "My email is john@doe.com - 1537836206101";
        const msgParams = [
            account,                            // Required
            message    // Required
        ];

        // 发起一个 签名请求
        // pageClient.signMessage(msgParams)
        //     .then((result) => {
        //         console.log("2.3 PageClient receive signature", result)
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     })

        const web3Test = new Web3(provider)
        web3Test.eth.sign(message, account).then(result => {
            console.log("2.4 web3Test  signature", result)
        })

        web3Test.eth.sendTransaction({
            from: account,
            to: account,
            value: "1"
        }).then(result => {
            console.log("2.4.1 web3TestsendTransaction", result)
        });


        const ethSigner = new ethers.providers.Web3Provider(provider).getSigner()
        ethSigner.signMessage(message).then(result => {
            console.log("2.5 ethSigner signMessage", result)
        })


        // pageClient.signTransaction(tx)
        //     .then((result) => {
        //         console.log("2.4 PageClient receive tx signature", result)
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     })

        // const ethSigner = new ethers.providers.Web3Provider(provider).getSigner()
        //
        // // const txx = await ethSigner.populateTransaction(tx)
        // ethSigner.sendTransaction(tx).then(result => {
        //     console.log("2.4 PageClient receive tx signature", result)
        // })

        // console.log(txxx)

        // const web3Test = new Web3(provider)
        // web3Test.eth.signTransaction(tx, account).then(result=>{
        //     console.log("2.4 PageClient receive tx signature", result)
        // })
        // const ll= await  web3Test.eth.sendSignedTransaction(signed.raw)
        // console.log(ll)

    })

    pageClient.on("disconnect", (val, e) => {
        // console.log("disconnect1", val, e)
        console.log("pageClient disconnect event", pageClient.connected)

    })
    //
    const mobileClient = new WalletConnect({
        bridge,
        uri: pageClient.uri
    })
    if (!mobileClient.connected) {
        mobileClient.on("session_request", async (val, e) => {
            console.log("1.1 WalletClient event: session_request Approve session")
            mobileClient.approveSession({chainId: signer.chainId, accounts: signer.accounts});
        })

        mobileClient.on("session_update", (val, e) => {
            console.log("mobileClient:session_update")
            // console.log("session_request", val, e)
            // console.log("session_request", mobileClient)
            // mobileClient.approveSession({chainId: 1, accounts: [account]});
        })

        mobileClient.on("call_request", async (n, e) => {
            console.log("WalletClient event call_request", e.id)
            const res = await signer.request(e)
            console.log("2.2 WalletClient SignMessage", res)
            mobileClient.approveRequest({
                id: e.id,
                jsonrpc: e.jsonrpc,
                result: res
            })
        })

        mobileClient.on("connect", (val, e) => {
            // console.log("connect2", val)
            // console.log("connect2 event",e)
            console.log("1.2 WalletClient event:connect", mobileClient.connected)
            // mobileClient.killSession()
        })

        mobileClient.on("disconnect", function (n, e) {
            console.log("mobileClient disconnect event")
        })
        // await mobileClient.createSession();
    }
    console.log("mobileClient Start");
})()


//
//   async sendTransaction(tx) {
//     this.connector.sendTransaction(tx)
//       .then((result) => {
//         // Returns transaction id (hash)
//         console.log(result)
//       })
//       .catch((error) => {
//         // Error returned when rejected
//         console.error(error)
//       })
//   }
//
//   async signTransaction(tx) {
//     this.connector.signTransaction(tx)
//       .then((result) => {
//         // Returns transaction id (hash)
//         console.log(result)
//       })
//       .catch((error) => {
//         // Error returned when rejected
//         console.error(error)
//       })
//   }
//
//   async signMessage(message: string) {
//     const msgParams = [
//       this.address                          // Required
//       // keccak256("\x19Ethereum Signed Message:\n" +  message.length + message))    // Required
//     ]
//     this.connector.signMessage(msgParams)
//       .then((result) => {
//         // Returns transaction id (hash)
//         console.log(result)
//       })
//       .catch((error) => {
//         // Error returned when rejected
//         console.error(error)
//       })
//   }
//
//   async signTypedData(typedData: any) {
//     const msgParams = [
//       this.address,                            // Required
//       typedData   // Required
//     ]
//     this.connector.signTypedData(msgParams)
//       .then((result) => {
//         // Returns transaction id (hash)
//         console.log(result)
//       })
//       .catch((error) => {
//         // Error returned when rejected
//         console.error(error)
//       })
//   }
//
//   async customRequest(typedData: any) {
//     const customRequest = {
//       id: 1337,
//       jsonrpc: '2.0',
//       method: 'eth_signTransaction',
//       params: [
//         {
//           from: this.address,
//           to: '0x89D24A7b4cCB1b6fAA2625Fe562bDd9A23260359',
//           data: '0x',
//           gasPrice: '0x02540be400',
//           gas: '0x9c40',
//           value: '0x00',
//           nonce: '0x0114'
//         }
//       ]
//     }
//     this.connector.sendCustomRequest(customRequest)
//       .then((result) => {
//         // Returns transaction id (hash)
//         console.log(result)
//       })
//       .catch((error) => {
//         // Error returned when rejected
//         console.error(error)
//       })
//   }
// }
