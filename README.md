# web3-js-builder

### Live and working

Available [here](https://kaiesh.com/web3-js-builder/)

### Convert solidity ABIs into fully functional JS interfaces

Crafting a JS interface for a solidity ABI is a repetitive process, and the more ABIs you have, the more cumbersome this becomes. This tool is designed to take ABIs as input, and output a JS file that can be passed to web2 developers for their immediate implementation.

It provides out-of-the-box support for Metamask, Binance Wallet, and WalletConnect. Support for read-only contract functions via Infura RPCs to any supported EVM are also available. Additionally, calls to web3 functions before contract initiatilisation are also protected against through promises which are only called back once the appropriate contract is ready and the necessary wallet is connected.

All components used are open-source and client-side, so customisation is encouraged - make a pull request for any additional functions or optimisations you think will benefit everyone else!

## Getting started

Run `index.html` on a local PHP enabled server.

Refer to <https://www.github.com/kaiesh/connect-web3-wallets> for options that can be used to extend the auto-generated JS.

## Usage instructions

- Mint your smart contract and retrieve the contract address along with the ABI JSON
- Visit <https://kaiesh.com/web3-js-builder/> and specify a developer friendly name for the contract, the contract address, and paste in the ABI JSON
- Hit build
- Send the resulting JS file to your Web2 developer
