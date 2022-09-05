#! --openssl-legacy-provider
import { ecSignHash, privateKeysToAddress, privateKeyToAddress, SignerProvider } from '../src/signerProvider'
import secrets from '../../../secrets.json'


const address =   privateKeyToAddress(secrets.privateKeys[0])
const signer = new SignerProvider({ chainId: 4,address, privateKeys: secrets.privateKeys })

;(async () => {
  const getBlock = {
    id: 1660099041612391,
    jsonrpc: '2.0',
    method: 'eth_signTransaction',
    params: [
      {
        from: '0x32f4b63a46c1d12ad82cabc778d75abf9889821a',
        to: '0x32f4B63A46c1D12AD82cABC778D75aBF9889821a',
        gasPrice: '0x649534e00',
        gas: '0x5208',
        value: '0x0',
        data: '0x'
      }
    ]
  }

  const foo = await signer.request(getBlock)
  console.log(foo)


})()

