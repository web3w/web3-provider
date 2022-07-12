import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";

const account = "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"
;(async () => {
    // wc:6d237935-a09f-4bcf-90e2-634c86bc28ca@1?bridge=https%3A%2F%2Felement-api.eossql.com%2Fbridge%2Fwalletconnect&key=dcbf193b4675026a651c69a69064bf01b1d98df3c8f21a21ffdad3a2b6abbe6f
    // 6d237935-a09f-4bcf-90e2-634c86bc28ca
    // dcbf193b4675026a651c69a69064bf01b1d98df3c8f21a21ffdad3a2b6abbe6f

    // client
    const pageClient = new WalletConnectProvider()
    console.log(pageClient.uri)
    await pageClient.createSession()
    // await provider.enable()
    //this._key
    //this.clientId
    console.log(pageClient.uri)
    pageClient.on("connect", (val) => {
        console.log("connect", val)
        console.log("pageClient connect event", pageClient.connected)

        const message = "My email is john@doe.com - 1537836206101";

        const msgParams = [
            account,                            // Required
            "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"    // Required
        ];

        // 发起一个 签名请求
        pageClient.connector.signMessage(msgParams)
            .then((result) => {
                // Returns signature.
                console.log(result)
            })
            .catch(error => {
                // Error returned when rejected
                console.error(error);
            })

    })

    // mobile
    const walletClient = new WalletConnect({bridge:pageClient.connector.bridge,uri: pageClient.uri});
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
    }

    // console.log(pageClient.connector.clientMeta)

})()
