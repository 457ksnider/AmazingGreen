const path = require('path')
const webpack = require("webpack");

module.exports = {
  reactStrictMode: false,
  webpack: (config,options) => {
  config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      
        resource.request = resource.request.replace(/^node:/, "");
      })
    );
    config.resolve.fallback = {
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "os": false,
      "assert": require.resolve("assert"),
      "os-browserify": require.resolve('os-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
      crypto: require.resolve('crypto-browserify'),
      stream: false,
      buffer: require.resolve('buffer'),
    };

    return config;
  }
}