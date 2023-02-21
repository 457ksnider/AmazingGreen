import * as dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
dotenv.config();

module.exports = {
	networks: {
		//Specifing Moonbeam Testnet network for smart contract deploying
		moonbase: {
			url: "https://rpc.api.moonbase.moonbeam.network",
			accounts: [`9873c363370664864c07abfd6d50cf7ad19b490c0a60b707a51e390e004d6a62`],
			chainId: 1287,
			gasPrice: 10_000_000_000
		},
		goerli: {
			url: "https://rpc.ankr.com/eth_goerli",
			accounts: [`9873c363370664864c07abfd6d50cf7ad19b490c0a60b707a51e390e004d6a62`],
			chainId: 5,
			gasPrice: 10_000_000_000
		},
		bsc: {
			url: "https://data-seed-prebsc-1-s3.binance.org:8545",
			accounts: [`9873c363370664864c07abfd6d50cf7ad19b490c0a60b707a51e390e004d6a62`],
			chainId: 97,
			gasPrice: 10_000_000_000
		},
		alfajore: {
			url: "https://alfajores-forno.celo-testnet.org",
			accounts: [`9873c363370664864c07abfd6d50cf7ad19b490c0a60b707a51e390e004d6a62`],
			chainId: 44787,
			name: "Celo Alfajore Testnet",
			gasPrice: 10_000_000_000
		},
	},
	//Specifing Solidity compiler version
	solidity: {
		compilers: [
			{
				version: '0.7.6',
			},
			{
				version: '0.8.6',
			},
		],
	},
	//Specifing Account to choose for deploying
	namedAccounts: {
		deployer: 0,
	}
};