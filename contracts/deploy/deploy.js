import {ethers} from "hardhat";
import config from "../chaininfo/config.json";
const hre = require("hardhat");
const colors = require("colors");
async function main() {
	const {deployments} = hre;
	const {deploy} = deployments;

	const [deployer] = await ethers.getSigners();
	let currentNetwork = await deployer.provider.getNetwork();
	let network = config[currentNetwork.chainId.toString()];
	console.log(`${colors.green("Deploying")}${colors.red(" AmazingGreen ")}${colors.white("to: ")}${colors.blue(network.name)}${colors.white(" from ")}${colors.yellow(deployer.address)}`);

	const contract = await deploy("AmazingGreen", {
		from: deployer.address,
		args: [],
		log: true
	});

	console.log(colors.green( "Deployed: ") + colors.yellow( contract.address) );
}

main()
	.then(() => process.exit())
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

