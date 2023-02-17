import React, {useState, useEffect} from "react";
import Dialog, {DialogProps} from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {styled} from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import {ethers} from "ethers";
import FormControl, {useFormControl} from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";

import LoadingButton from "@mui/lab/LoadingButton";
import Container from "@mui/material/Container";
import {getChain} from "../../../services/useContract";
import Alert from "@mui/material/Alert";
import useContract from "../../../services/useContract";

import {sendTransfer} from "../../../services/wormhole/useSwap";
export default function DonateCoin({ideasid,show, onHide, address}) {
	const [Balance, setBalance] = useState("");
	const [CurrentChain, setCurrentChain] = useState("");
	const [CurrentAddress, setCurrentAddress] = useState("");
	const [isLoading, setisLoading] = useState(false);
	const [isSent, setisSent] = useState(false);
	const { contract, signerAddress,sendTransaction } = useContract()
	const [showSwap, setshowSwap] = useState(false);
	let alertBox = null;
	const [transaction, setTransaction] = useState({
		link: "",
		token: ""
	});

	function ShowAlert(type = "default", message) {
		const pendingAlert = alertBox.children["pendingAlert"];
		const successAlert = alertBox.children["successAlert"];
		const errorAlert = alertBox.children["errorAlert"];

		alertBox.style.display = "block";
		pendingAlert.style.display = "none";
		successAlert.style.display = "none";
		errorAlert.style.display = "none";
		switch (type) {
			case "pending":
				pendingAlert.querySelector(".MuiAlert-message").innerText = message;
				pendingAlert.style.display = "flex";
				break;
			case "success":
				successAlert.querySelector(".MuiAlert-message").innerText = message;
				successAlert.style.display = "flex";
				break;
			case "error":
				errorAlert.querySelector(".MuiAlert-message").innerText = message;
				errorAlert.style.display = "flex";
				break;
		}
	}

	async function DonateCoinSubmission(e) {
		e.preventDefault();
		console.clear();
		setisSent(false);
		const {amount} = e.target;
		alertBox = e.target.querySelector("[name=alertbox]");
		setisLoading(true);
		let output = await sendTransfer(Number(window.ethereum.networkVersion), amount.value, address, ShowAlert);
		setTransaction({
			link: output.transaction,
			token: output?.wrappedAsset
		});
		   // Saving Donation count on smart contract
		   await sendTransaction(contract.add_donation(Number(ideasid), ethers.utils.parseUnits(amount.value, 'gwei')));		
		if (Number(window.ethereum.networkVersion) === 1287) {
			setshowSwap(false);
		}else{
			setshowSwap(true);
		}
		LoadData();
		setisLoading(false);
		setisSent(true);
	}
	const StyledPaper = styled(Paper)(({theme}) => ({
		backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
		...theme.typography.body2,
		padding: theme.spacing(2),
		color: theme.palette.text.primary
	}));
	async function LoadData() {
		const Web3 = require("web3");
		const web3 = new Web3(window.ethereum);
		let Balance = await web3.eth.getBalance(window.ethereum.selectedAddress);
		let token = " " + getChain(Number(window.ethereum.networkVersion)).nativeCurrency.symbol;
		setBalance((Balance / 1000000000000000000).toFixed(5) + token);
		setCurrentChain(getChain(Number(window.ethereum.networkVersion)).name);
		setCurrentAddress(window.ethereum.selectedAddress);
	}
	useEffect(() => {
		LoadData();
	}, [show]);

	return (
		<Dialog open={show} onClose={onHide} fullWidth="true" aria-labelledby="contained-modal-title-vcenter" centered="true">
			<DialogTitle>Donate Coin</DialogTitle>
			<DialogContent>
				<Container>
					<form id="doanteForm" onSubmit={DonateCoinSubmission} autoComplete="off">
						<div name="alertbox" hidden="true">
							<Alert variant="filled" sx={{my: 1}} name="pendingAlert" severity="info">
								Pending....
							</Alert>
							<Alert variant="filled" sx={{my: 1}} name="successAlert" severity="success">
								Success....
							</Alert>
							<Alert variant="filled" sx={{my: 1}} name="errorAlert" severity="error">
								Error....
							</Alert>
						</div>
						{isSent ? (
							<>
								{showSwap ? (
									<>
										<StyledPaper sx={{my: 1, mx: "auto", p: 2}}>
											<div variant="standard">
												<InputLabel sx={{color: "black"}}>Wrapped Token Address</InputLabel>
												<a className="text-[#0000ff]">{transaction.token}</a>
												<p>
													Swap your token at{" "}
													<a className="text-[#0000ff]" href="https://moonbeam-swap.netlify.app/#/swap" rel="noreferrer" target="_blank">
														https://moonbeam-swap.netlify.app/#/swap
													</a>
												</p>
											</div>
										</StyledPaper>
									</>
								) : (
									<></>
								)}

								<StyledPaper sx={{my: 1, mx: "auto", p: 2}}>
									<div variant="standard" className="overflow-hidden">
										<InputLabel sx={{color: "black"}}>Transaction</InputLabel>
										<a href={transaction.link} className="text-[#0000ff]" rel="noreferrer" target="_blank">
											{transaction.link}
										</a>
									</div>
								</StyledPaper>
							</>
						) : (
							<></>
						)}

						<StyledPaper sx={{my: 1, mx: "auto", p: 2}}>
							<div variant="standard">
								<InputLabel>Target Chain</InputLabel>
								<span>Moonbase Alpha</span>
							</div>
						</StyledPaper>
						<StyledPaper sx={{my: 1, mx: "auto", p: 2}}>
							<div variant="standard">
								<InputLabel>Target Address</InputLabel>
								<span>{address}</span>
							</div>
						</StyledPaper>
						<StyledPaper sx={{my: 1, mx: "auto", p: 2}}>
							<div variant="standard">
								<InputLabel>From Chain</InputLabel>
								<span>{CurrentChain}</span>
							</div>
						</StyledPaper>
						<StyledPaper sx={{my: 1, mx: "auto", p: 2}}>
							<div variant="standard">
								<InputLabel>From Address</InputLabel>
								<span>{CurrentAddress} (Your)</span>
							</div>
						</StyledPaper>
						<StyledPaper sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", my: 1, mx: "auto", p: 2}}>
							<FormControl variant="standard">
								<InputLabel>Amount</InputLabel>
								<Input name="amount" />
							</FormControl>
							<div>
								<InputLabel>Balance</InputLabel>
								<p>{Balance}</p>
							</div>
						</StyledPaper>

						<DialogActions>
							<LoadingButton type="submit" name="DonateBTN" loading={isLoading} className="btn-secondary" size="medium">
								Donate
							</LoadingButton>
						</DialogActions>
					</form>
				</Container>
			</DialogContent>
		</Dialog>
	);
}

