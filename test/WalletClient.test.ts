// import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";
import {privateKeyToAddress, SignerProvider} from "../src/signerProvider";

import {WalletProvider} from "../src/walletProvider";
import secrets from '../../../secrets.json'
import Web3 from "web3";
import {ethers} from "ethers";
import {WalletClient} from "../src/walletClient";
import {CHAIN_CONFIG} from "../src/utils/chain";

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


;(async () => {

    const account = "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"
    const bridge = "https://bridge.walletconnect.org"
    // Create a connector
    const provider = new WalletProvider({
        chainId: 4,
        bridge, // Requireda
    });


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
        pageClient.signMessage(msgParams)
            .then((result) => {
                console.log("2.3 PageClient receive signature", result)
            })
            .catch(error => {
                console.error(error);
            })

        // pageClient.signTransaction(tx)
        //     .then((result) => {
        //         console.log("2.4 PageClient receive tx signature", result)
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     })

        // const ethersTest = new ethers.providers.Web3Provider(provider)
        // const ethSigner = ethersTest.getSigner()
        // const txx = await ethSigner.populateTransaction(tx)
        // ethSigner.sendTransaction(txx).then(result => {
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
    const mobileClient = new WalletClient(provider, {
        chainId: 4,
        rpcUrl: CHAIN_CONFIG[4].rpcs[0],
        privateKey:secrets.privateKeys[0]
    })
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
