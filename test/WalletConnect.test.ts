// import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";

;(async () => {

    const account = "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"
    const bridge = "https://bridge.walletconnect.org"
    // Create a connector
    const connector1 = new WalletConnect({
        bridge, // Required
    });
    //
    await connector1.createSession();

    connector1.on("connect", (val, e) => {
        // console.log("connect1", val, e)
        console.log("connect1", connector1.connected)

        const message = "My email is john@doe.com - 1537836206101";

        const msgParams = [
            account,                            // Required
            "0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"    // Required
        ];

        connector1
            .signMessage(msgParams)
            .then((result) => {

                // Returns signature.
                console.log(result)
            })
            .catch(error => {
                // Error returned when rejected
                console.error(error);
            })

    })

    connector1.on("session_update", (val, e) => {
        // console.log("session_update1", val, e)
        console.log("session_update1", connector1.connected)

    })

    connector1.on("disconnect", (val, e) => {
        // console.log("disconnect1", val, e)
        console.log("disconnect1", connector1.connected)

    })
    //
    const connector2 = new WalletConnect({
        bridge,
        uri: connector1.uri
    })
    if (!connector2.connected) {
        console.log("connector2:createSession")
        await connector2.createSession();

        connector2.on("session_request", (val, e) => {
            console.log("connector2:session_request")
            // console.log("session_request", val, e)
            // console.log("session_request", connector2)
            connector2.approveSession({chainId: 1, accounts: [account]});
        })

        connector2.on("session_update", (val, e) => {
            console.log("connector2:session_update")
            // console.log("session_request", val, e)
            // console.log("session_request", connector2)
            // connector2.approveSession({chainId: 1, accounts: [account]});
        })

        connector2.on("call_request", function (n, e) {
            console.log("EVENT", "call_request", "method", e.method)
            console.log("EVENT", "call_request", "params", e.params)
            connector2.approveRequest({
                id: 1,
                jsonrpc: "20",
                result: "0xlll"
            })
        })

        connector2.on("connect", (val, e) => {
            // console.log("connect2", val)
            // console.log("connect2 event",e)
            console.log("connect2", connector2.connected)
            // connector2.killSession()
        })

        connector2.on("disconnect", function (n, e) {
            console.log("EVENT", "disconnect2")
        })
        // await connector2.createSession();
    }


    console.log("ACTION", "approveSession");

    // if (connector2) {
    //     connector2.approveSession({chainId: 1, accounts: ["0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401"]});
    // }

})()
