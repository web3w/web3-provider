# web3-provider

https://web3w.github.io/web3-provider/

## For ethers.js
### connect
```ts
    public connect = async () => { 
        const provider = new WalletProvider({qrcode: QRCodeModal, bridge});
        const ethersSigner = new ethers.providers.Web3Provider(provider).getSigner()
       
        if (!provider.connected) { 
            await provider.open();
        } 
        // subscribe to events
        provider.on("connect", (error, payload) => {
            if (error) {
                throw error;
            }
            this.onConnect(payload);
        });
    
        provider.on("disconnect", (error, payload) => {
            if (error) {
                throw error;
            }
            this.onDisconnect();
        });
    }; 
```
### signMessage
```ts
 public testStandardSignMessage = async () => {
    const {address, ethersSigner, chainId} = this.state;

    if (!ethersSigner) {
        return;
    }

    // test message
    const message = `My email is web3wr@gmail.com ethers.js - ${new Date().toUTCString()}`;
 

    try { 
        const result = await ethersSigner.signMessage(message);

        // verify signature
        const hash = hashMessage(message);
        const valid = await verifySignature(address, result, hash, chainId);
        const formattedResult = {
            method: "eth_sign (standard)",
            address,
            valid,
            result,
        };
 
    } catch (error) { 
        console.error(error); 
    }
};
```
### close
```ts 
    public killSession = async () => {
        const {provider} = this.state;
        if (provider) {
            provider.close();
        }
        this.resetApp();
    };
```

## For web3.js
### connect
```ts
public connect = async () => {
    const provider = new WalletProvider({qrcode: QRCodeModal, bridge});
    const web3Signer = new Web3(provider)

    if (!provider.connected) {
        await provider.open();
    }
    // subscribe to events
    provider.on("connect", (error, payload) => {
        if (error) {
            throw error;
        }
        this.onConnect(payload);
    });

    provider.on("disconnect", (error, payload) => {
        if (error) {
            throw error;
        }
        this.onDisconnect();
    });
};
```
### signMessage
```ts
 public testStandardSignMessage = async () => {
    const {address, ethersSigner, chainId} = this.state;

    if (!ethersSigner) {
        return;
    }

    // test message
    const message = `My email is web3wr@gmail.com ethers.js - ${new Date().toUTCString()}`;
 

    try {
        const result = await web3Signer.eth.signMessage(msgParams);

        // verify signature
        const hash = hashMessage(message);
        const valid = await verifySignature(address, result, hash, chainId);
        const formattedResult = {
            method: "eth_sign (standard)",
            address,
            valid,
            result,
        };
 
    } catch (error) { 
        console.error(error); 
    }
};
```

### cloes
```ts
public killSession = async () => {
    const {provider} = this.state;
    if (provider) {
        provider.close();
    }
    this.resetApp();
};
```