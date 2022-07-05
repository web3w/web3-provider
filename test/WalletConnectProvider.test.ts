import {WalletConnectProvider} from "../src/wallet-connect-provider/index";
import WalletConnect from "@walletconnect/client";

;(async () => {
    // wc:6d237935-a09f-4bcf-90e2-634c86bc28ca@1?bridge=https%3A%2F%2Felement-api.eossql.com%2Fbridge%2Fwalletconnect&key=dcbf193b4675026a651c69a69064bf01b1d98df3c8f21a21ffdad3a2b6abbe6f
    // 6d237935-a09f-4bcf-90e2-634c86bc28ca
    // dcbf193b4675026a651c69a69064bf01b1d98df3c8f21a21ffdad3a2b6abbe6f
    const provider = new WalletConnectProvider()
    console.log(provider.connector.uri)
    await provider.connector.createSession()
    //this._key
    //this.clientId
    console.log(provider.connector.uri)


    provider.on("connect", (val) => {
        console.log("connect", val)
    })

    //
    const connector = new WalletConnect({uri: provider.connector.uri});
    if (!connector.connected) {
        await connector.createSession();
    }

    console.log(provider.connector.clientMeta)

})()
