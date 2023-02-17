import {ethers} from "hardhat";
import config from "../chaininfo/config.json";
const  hre = require("hardhat");
const colors = require("colors");
async function main() {
    const { deployments } = hre;
	const { deploy } = deployments;

	const [deployer] = await ethers.getSigners();
	let currentNetwork = await deployer.provider.getNetwork();
	let network = config[currentNetwork.chainId.toString()];
	console.log(`${colors.green("Deploying")}${colors.red(" Messenger ")}${colors.white("to: ")}${colors.blue(network.name)}${colors.white(" from ")}${colors.yellow(deployer.address)}`);

    const messenger = await deploy("Messenger", {
        from: deployer.address,
        args: [network.corebridgeAddress],
        log: true,
    });

	config[currentNetwork.chainId.toString()].MessengerAddress =  messenger.address;
	const fs = require("fs");
	fs.writeFileSync("./chaininfo/config.json",JSON.stringify(config, null, 4))
	console.log(colors.green( "Deployed: ") + colors.yellow( messenger.address) );

}

main()
	.then(() => process.exit())
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
