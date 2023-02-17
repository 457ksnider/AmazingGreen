import Web3 from "web3";

import erc721 from "../contracts/deployments/moonbase/AmazingGreen.json";
const sleep = milliseconds => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export default async function ERC721Singleton(signer) {
	let web3;
	web3 = new Web3("https://rpc.api.moonbase.moonbeam.network");
	try {
		await sleep(500)
		if (Number(window?.ethereum?.networkVersion) === Number(1287)) {
			web3 = new Web3(window.ethereum);
			console.log("using moonbase")
		}
	} catch (error) {	}
	
	const AmazingGreencontract = new web3.eth.Contract(erc721.abi, erc721.address).methods;

	return AmazingGreencontract;
}
