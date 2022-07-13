
## Webpack Config
`npm i url assert buffer net tls stream-browserify`

cd ./node_modules/react-scripts/config/  
[webpack.config.js](node_modules/react-scripts/config/webpack.config.js)
```ts
 resolve: {
    plugins: {
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        // ..
    },
    fallback: {
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert/"),
        "url":require.resolve("url"),
        "buffer": require.resolve("buffer/")
    }
}
      
```

