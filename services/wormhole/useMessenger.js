import {ethers} from "ethers";
import config from "../../contracts/chaininfo/config.json";
import messengerABI from "../../contracts/deployments/moonbase/Messenger.json";
import { getEmitterAddressEth,  parseSequenceFromLogEth } from '@certusone/wormhole-sdk';

export async function sendMessage(chainid,ideaId, msg) {


	let FromNetwork = config[chainid];

	const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
	//From Sending Chain
	const FromContract = new ethers.Contract(FromNetwork.MessengerAddress, messengerABI.abi, signer);

	if (Number(window.ethereum.networkVersion) === 1287){ //If it is sending from Moonbase then it will not use bridge
		await FromContract.sendMsgLOCAL(ideaId,msg, {
			gasLimit: 600000,
			gasPrice: ethers.utils.parseUnits("10", "gwei")
		});
		return;
	}

	const tx = await (
		await FromContract.sendMsg(ideaId,msg, {
			gasLimit: 600000,
			gasPrice: ethers.utils.parseUnits("10", "gwei")
		})).wait();
	const seq = parseSequenceFromLogEth(tx, FromNetwork["corebridgeAddress"]);
	const emitterAddr = getEmitterAddressEth(FromNetwork.MessengerAddress);
	let vaaBytes = {
		vaaBytes: null
	};
	while (!vaaBytes["vaaBytes"]) {
		await new Promise((r) => setTimeout(r, 5000)); //wait for Guardian to pick up message
		console.log("Searching for: ", `${config.wormhole.restAddress}/v1/signed_vaa/${FromNetwork.wormholeChainId}/${emitterAddr}/${seq}`);
		vaaBytes = await (await fetch(`${config.wormhole.restAddress}/v1/signed_vaa/${FromNetwork.wormholeChainId}/${emitterAddr}/${seq}`)).json();
	}

	//Target Chain Moonbase
	const targetNetwork = config["1287"]; //Moonbase
	const TargetSigner = new ethers.Wallet(targetNetwork.privateKey).connect(new ethers.providers.JsonRpcProvider(targetNetwork.rpc));
	const TargetContract = new ethers.Contract(targetNetwork.MessengerAddress, messengerABI.abi, TargetSigner);

	await (await TargetContract.receiveEncodedMsg(Buffer.from(vaaBytes.vaaBytes, "base64"))).wait();
}



export async function getAllMessagesByIdea(ideaId) {
	//Target Chain Moonbase
	const targetNetwork = config["1287"]; //Moonbase
	const TargetSigner = new ethers.Wallet(targetNetwork.privateKey).connect(new ethers.providers.JsonRpcProvider(targetNetwork.rpc));
	const TargetContract = new ethers.Contract(targetNetwork.MessengerAddress, messengerABI.abi, TargetSigner);
	let output = await TargetContract.getCurrentMsges(ideaId);
	return output === ""? []:JSON.parse(output);
}
