// import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";
import {WalletProvider} from "../src/walletProvider";
import Web3 from "web3";

;(async () => {

    const account = "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"
    const bridge = "https://bridge.walletconnect.org"
    // Create a connector
    const provider = new WalletProvider({
        bridge, // Required
    });

    const pageClient = provider.connector
    //createSession 生产 uri
    await pageClient.createSession();

    const test = new Web3(provider)

    pageClient.on("connect", async (val, e) => {
        // console.log("connect1", val, e)
        console.log("pageClient connect event", pageClient.connected)

        const message = "My email is john@doe.com - 1537836206101";

        const msgParams = [
            account,                            // Required
            "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"    // Required
        ];


        // const num = await test.eth.getBlockNumber()
        const s = await test.eth.sign("-------", account)

        debugger
        // 发起一个 签名请求
        // pageClient.signMessage(msgParams)
        //     .then((result) => {
        //         // Returns signature.
        //         console.log(result)
        //     })
        //     .catch(error => {
        //         // Error returned when rejected
        //         console.error(error);
        //     })

    })

    pageClient.on("session_update", (val, e) => {
        // console.log("session_update1", val, e)
        console.log("pageClient session_update event", pageClient.connected)

    })

    pageClient.on("disconnect", (val, e) => {
        // console.log("disconnect1", val, e)
        console.log("pageClient disconnect event", pageClient.connected)

    })
    //
    const walletClient = new WalletConnect({
        bridge,
        uri: pageClient.uri
    })
    if (!walletClient.connected) {
        console.log("1. walletClient:createSession")
        await walletClient.createSession();
        walletClient.on("session_request", (val, e) => {
            console.log("2. walletClient:session_request")
            // console.log("session_request", val, e)
            // console.log("session_request", walletClient)
            walletClient.approveSession({chainId: 1, accounts: [account]});
        })

        walletClient.on("session_update", (val, e) => {
            console.log("walletClient:session_update")
            // console.log("session_request", val, e)
            // console.log("session_request", walletClient)
            // walletClient.approveSession({chainId: 1, accounts: [account]});
        })

        walletClient.on("call_request", function (n, e) {
            console.log("walletClient", "call_request", "method", e.method)
            console.log("walletClient", "call_request", "params", e.params)
            walletClient.approveRequest({
                id: 1,
                jsonrpc: "20",
                result: "0xlll"
            })
        })

        walletClient.on("connect", (val, e) => {
            // console.log("connect2", val)
            // console.log("connect2 event",e)
            console.log("3. walletClient connect event", walletClient.connected)
            // walletClient.killSession()
        })

        walletClient.on("disconnect", function (n, e) {
            console.log("walletClient disconnect event")
        })
        // await walletClient.createSession();
    }


    console.log("ACTION", "approveSession");

    // if (walletClient) {
    //     walletClient.approveSession({chainId: 1, accounts: ["0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"]});
    // }

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
