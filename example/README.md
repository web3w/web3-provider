##web3-provider

https://web3w.github.io/web3-provider/

### node 18
`"start": "GENERATE_SOURCEMAP=false react-scripts  --openssl-legacy-provider start",`

## Webpack Config

wallet-connect  
`npm i url assert buffer net tls stream-browserify `

``
 

rm -fr node_modules/.cache

web3  
`npm i crypto-browserify https-browserify stream-http  os-browserify `
```ts
- add a fallback 'resolve.fallback: { "crypto": require.resolve("crypto-browserify") }'
    - install 'crypto-browserify'

- add a fallback 'resolve.fallback: { "https": require.resolve("https-browserify") }'
    - install 'https-browserify'
     
- add a fallback 'resolve.fallback: { "http": require.resolve("stream-http") }'
    - install 'stream-http'
    
- add a fallback 'resolve.fallback: { "os": require.resolve("os-browserify/browser") }'
    - install 'os-browserify'
      resolve.fallback: { "os": false }
```
 
cd ./node_modules/react-scripts/config/  
[webpack.config.js](node_modules/react-scripts/config/webpack.config.js)
```ts
 resolve: {
    fallback: {
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert/"),
        "url":require.resolve("url"),
        "buffer": require.resolve("buffer/"),
        "crypto": require.resolve("crypto-browserify"),
        "https": require.resolve("https-browserify"),
        "http": require.resolve("stream-http"),
        "os": require.resolve("os-browserify/browser")
    }
} 
plugins: {
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
},
      
```

