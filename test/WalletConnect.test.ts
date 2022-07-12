// import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";

;(async () => {

    const account = "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"
    const bridge = "https://bridge.walletconnect.org"
    // Create a connector
    const pageClient = new WalletConnect({
        bridge, // Required
    });
    //createSession 生产 uri
    await pageClient.createSession();

    pageClient.on("connect", (val, e) => {
        // console.log("connect1", val, e)
        console.log("pageClient connect event", pageClient.connected)

        const message = "My email is john@doe.com - 1537836206101";

        const msgParams = [
            account,                            // Required
            "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"    // Required
        ];

        // 发起一个 签名请求
        pageClient.signMessage(msgParams)
            .then((result) => {
                // Returns signature.
                console.log(result)
            })
            .catch(error => {
                // Error returned when rejected
                console.error(error);
            })

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
