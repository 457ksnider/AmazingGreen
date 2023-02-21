import { useState, useEffect } from "react";
import { ethers } from "ethers"
import erc721 from "../contracts/deployments/moonbase/AmazingGreen.json"
import InterChainABI from "./json/InterChainABI.json"
import IGPABI from "./json/IGPABI.json"
import ERC721Singleton from "./ERC721Singleton"
import chains from "./json/chains.json"
import { HyperlaneCore, MultiProvider, chainConnectionConfigs } from "@hyperlane-xyz/sdk"

export default function useContract() {
	const [contractInstance, setContractInstance] = useState({
		contract: null,
		signerAddress: null,
		sendTransaction: sendTransaction,
		currentChain: null
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				const provider = new ethers.providers.Web3Provider(window.ethereum)
				const signer = provider.getSigner()
				const contract = { contract: null, signerAddress: null, sendTransaction: sendTransaction, currentChain: null }

				contract.contract = await ERC721Singleton(signer)
				window.contract = contract.contract;
				contract.signerAddress = await signer.getAddress()
				contract.currentChain = getChain(window.ethereum.networkVersion);

				setContractInstance(contract)
			} catch (error) {
				console.error(error)
			}
		}

		fetchData()
	}, [])

	 async function sendTransaction(methodWithSignature) {
		if (Number(window.ethereum.networkVersion) === 1287){ //If it is sending from Moonbase then it will not use bridge
			await methodWithSignature.send({
				from: window.ethereum.selectedAddress,
				gasPrice: 10_000_000_000
			})
			return;
		}
		let encoded = methodWithSignature.encodeABI()
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		var domain_id = 1287; //Moonbase alpha Domain ID where main contract is deployed


		const multiProvider = new MultiProvider({
			alfajores: chainConnectionConfigs.alfajores,
			bsctestnet: chainConnectionConfigs.bsctestnet,
			goerli: chainConnectionConfigs.goerli,
			moonbasealpha: chainConnectionConfigs.moonbasealpha
		})

		const core = HyperlaneCore.fromEnvironment("testnet2", multiProvider)

		const InterChaincontract = new ethers.Contract(InterChainABI.address, InterChainABI.abi, signer)
		const tx = await InterChaincontract["dispatch(uint32,address,bytes)"](domain_id, erc721.address, encoded)
		const reciept = await tx.wait()
		console.log("Dispatch Reciept ===>", reciept)
		let messageId =reciept.logs[1].topics[1];
		console.log("Message ID ========>"+messageId)

		let gasFee = ethers.utils.parseUnits("0.00000000000001",18);
		let gasAmount = 55500000000		;
		const IGPcontract = new ethers.Contract(IGPABI.address, IGPABI.abi, signer)
		
		const txIGP = await IGPcontract["payForGas(bytes32,uint32,uint256,address)"](messageId, domain_id, gasAmount, window.ethereum.selectedAddress,{
			value:gasFee
		})
		const recieptIGP = await txIGP.wait()
		console.log(recieptIGP);
		await core.waitForMessageProcessed(recieptIGP)
	}


	return contractInstance
}

export function getChain(chainid) {
	for (let i = 0; i < chains.allchains.length; i++) {
		const element = chains.allchains[i]
		if (element.chainId === chainid) {
			return element
		}
	}
	return chains.allchains[0];
}