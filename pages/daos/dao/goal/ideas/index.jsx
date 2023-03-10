import {Button} from "@heathmont/moon-core-tw";
import Head from "next/head";
import {useEffect, useState} from "react";
import NavLink from "next/link";
import SlideShow from "../../../../../components/components/Slideshow";
import useContract from "../../../../../services/useContract";
import {ControlsChevronLeft} from "@heathmont/moon-icons-tw";

import UseFormTextArea from "../../../../../components/components/UseFormTextArea";
import isServer from "../../../../../components/isServer";
import DonateCoin from "../../../../../components/components/modal/DonateCoin";
import {Header} from "../../../../../components/layout/Header";
import styles from "../../../daos.module.css";
import Skeleton from "@mui/material/Skeleton";
import CommentBox from "../../../../../components/components/Card/Comment";
import {sendMessage, getAllMessagesByIdea} from "../../../../../services/wormhole/useMessenger";
import {useSnackbar} from "notistack";
import {usePolkadotContext} from "../../../../../contexts/PolkadotContext";

let IdeasEnd = "";
let IdeasWaiting = false;
let running = true;
export default function GrantIdeas() {
	//variables
	const [goalId, setGoalId] = useState(-1);
	const [ideaId, setIdeasId] = useState(-1);
	const [imageList, setimageList] = useState([]);
	const [IdeasURI, setIdeasURI] = useState({ideasId: "",postid:0, Title: "", Description: "", wallet: "", logo: "", End_Date: "", voted: 0, isVoted: true, allfiles: []});
	const [DonatemodalShow, setDonatemodalShow] = useState(false);
	const [AccountAddress, setAccountAddress] = useState("");
	const {contract, signerAddress, sendTransaction} = useContract();
	const {enqueueSnackbar, closeSnackbar} = useSnackbar();
	const {createComment,getCommentForAPost,status} = usePolkadotContext();

	const [Comment, CommentInput, setComment] = UseFormTextArea({
		defaultValue: "",
		placeholder: "Your comment",
		id: "",
		name: "comment",
		rows: 6
	});
	const [emptydata, setemptydata] = useState([]);

	const [CommentsList, setCommentsList] = useState([
		{
			id: 0,
			comment: "",
			address: "",
			date: "",
			replies: [
				{
					id: 0,
					message: "",
					address: "",
					date: ""
				}
			]
		}
	]);
	const formatter = new Intl.NumberFormat("en-US", {
		//Converting number into comma version
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	const sleep = (milliseconds) => {
		//Custom Sleep function to wait
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	};
	let m;
	let id = ""; //Ideas id from url
	let Goalid = ""; //Goal id
	function LeftDate(datetext) {
		//String date to dd/hh/mm/ss format

		var c = new Date(datetext).getTime();
		var n = new Date().getTime();
		var d = c - n;
		var da = Math.floor(d / (1000 * 60 * 60 * 24));
		var h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
		var s = Math.floor((d % (1000 * 60)) / 1000);
		return da.toString() + " Days " + h.toString() + " hours " + m.toString() + " minutes " + s.toString() + " seconds";
	}
	function LeftDateSmall(datetext) {
		//String date to d/h/m/s format

		var c = new Date(datetext).getTime();
		var n = new Date().getTime();
		var d = c - n;
		var da = Math.floor(d / (1000 * 60 * 60 * 24));
		var h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
		var s = Math.floor((d % (1000 * 60)) / 1000);
		if (IdeasEnd === "Finished" && s.toString().includes("-")) {
			return "Ideas Ended";
		} else if (s.toString().includes("-") && IdeasWaiting === true && IdeasEnd !== "Finished") {
			return "Waiting for release";
		} else {
			return da.toString() + "d " + h.toString() + "h " + m.toString() + "m " + s.toString() + "s" + " left";
		}
	}

	useEffect(() => {
		const fetch = async () => {
			await sleep(150);
			if (contract !== null) {
				fetchContractData();
			}
		};
		fetch();
	}, [status]);

	useEffect(() => {
		DesignSlide();
	});

	if (isServer()) return null;
	const regex = /\[(.*)\]/g;
	const str = decodeURIComponent(window.location.search);

	while ((m = regex.exec(str)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches

		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		id = m[1];
	}

	async function fetchContractData() {
		running = true;
		try {
			if (contract && id) {
				setIdeasId( Number(id)); //setting Ideas id
				id = Number(id);

				const ideaURI = await contract.ideas_uri(Number(id)).call(); //Getting ideas uri
				const object = JSON.parse(ideaURI); //Getting ideas uri
				Goalid = await contract.get_goal_id_from_ideas_uri(ideaURI).call();
				setGoalId(Goalid);
				const goalURI = JSON.parse(await contract.goal_uri(Number(Goalid)).call()); //Getting goal URI
				let isvoted = false;
				let voted = 0;

				const Allvotes = await contract.get_ideas_votes_from_goal(Number(Goalid), Number(id)).call(); //Getting all votes
				for (let i = 0; i < Allvotes.length; i++) {
					const element = Allvotes[i];
					if (element !== "") voted++;
					if (element === window.ethereum.selectedAddress) isvoted = true;
				}
				setAccountAddress(object.properties.wallet.description);

				setIdeasURI({
					ideasId: id,
					postid:Number( object.properties.postid),
					Title: object.properties.Title.description,
					Description: object.properties.Description.description,
					wallet: object.properties.wallet.description,
					logo: object.properties.logo.description.url,
					End_Date: goalURI.properties.End_Date?.description,
					voted: voted,
					donation: Number((await contract._ideas_uris(Number(id)).call()).donation) / 10 ** 9,
					isVoted: isvoted,
					allfiles: object.properties.allFiles
				});

				setimageList(object.properties.allFiles);
				// setCommentsList(await getAllMessagesByIdea(Number(id)));

				const comments =await getCommentForAPost(Number( object.properties.postid));
				setCommentsList(comments)

				if (document.getElementById("Loading")) document.getElementById("Loading").style = "display:none";
			}
		} catch (error) {
			console.error(error);
		}
		running = false;
	}

	async function DesignSlide() {
		if (document.querySelector('[data-type="prev"]') !== null) {
			document.querySelector('[data-type="prev"]').innerHTML =
				'<div className="undefined nav " data-type="prev" aria-label="Previous Slide" style="width: 45px;margin-right: -50px;cursor: pointer;"><div className="undefined nav " data-type="prev" aria-label="Previous Slide" style="color: black;cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 79"><svg xmlns="http://www.w3.org/2000/svg" width="79" height="79" fill="none"><g filter="url(#filter0_b_48_4254)"><circle cx="39.5" cy="39.5" r="39.5" fill="white"></circle><circle cx="39.5" cy="39.5" r="39.25" stroke="#C4C4C4" stroke-width="0.5"></circle></g><path d="M29.0556 39.9087L42.3821 26.6582C42.8187 26.2244 43.5256 26.2251 43.9615 26.6605C44.3971 27.0958 44.3959 27.801 43.9592 28.2353L31.426 40.6971L43.9597 53.1588C44.3963 53.5931 44.3974 54.2979 43.9619 54.7333C43.7434 54.9515 43.4572 55.0606 43.1709 55.0606C42.8854 55.0606 42.6002 54.9522 42.3821 54.7355L29.0556 41.4854C28.8453 41.2768 28.7273 40.9929 28.7273 40.6971C28.7273 40.4013 28.8456 40.1177 29.0556 39.9087Z" fill="black"></path><defs><filter id="filter0_b_48_4254" x="-4" y="-4" width="87" height="87" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feGaussianBlur in="BackgroundImageFix" stdDeviation="2"></feGaussianBlur><feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_48_4254"></feComposite><feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_48_4254" result="shape"></feBlend></filter></defs></svg></svg></div></div>';
			document.querySelector('[data-type="next"]').innerHTML =
				'<div className="undefined nav " data-type="next" aria-label="Next Slide" style="width: 45px;margin-left: -17px;cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 79" fill="#2e2e2e"><svg width="79" height="79" viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_b_48_4262)"><circle cx="39.5" cy="39.5" r="39.5" fill="white"></circle><circle cx="39.5" cy="39.5" r="39.25" stroke="#C4C4C4" stroke-width="0.5"></circle></g><path d="M43.9596 41.4853L30.6331 54.7358C30.1965 55.1697 29.4896 55.169 29.0537 54.7336C28.6181 54.2982 28.6192 53.593 29.0559 53.1588L41.5892 40.697L29.0555 28.2352C28.6188 27.801 28.6177 27.0962 29.0532 26.6608C29.2717 26.4425 29.558 26.3334 29.8443 26.3334C30.1298 26.3334 30.4149 26.4418 30.633 26.6585L43.9596 39.9087C44.1699 40.1173 44.2879 40.4012 44.2879 40.697C44.2879 40.9928 44.1696 41.2763 43.9596 41.4853Z" fill="black"></path><defs><filter id="filter0_b_48_4262" x="-4" y="-4" width="87" height="87" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feGaussianBlur in="BackgroundImageFix" stdDeviation="2"></feGaussianBlur><feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_48_4262"></feComposite><feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_48_4262" result="shape"></feBlend></filter></defs></svg></svg></div>';
			document.querySelector(".react-slideshow-zoom-wrapper").classList.add("rounded-xl");
			document.querySelector(".react-slideshow-container").classList.add("overflow-hidden rounded-xl");
			document.querySelector(".react-slideshow-container").style.height = "500px";
		}
	}

	setInterval(function () {
		calculateTimeLeft();
	}, 1000);

	function calculateTimeLeft() {
		//Calculating time left
		try {
			var allDates = document.getElementsByName("dateleft");
			for (let i = 0; i < allDates.length; i++) {
				var date = allDates[i].getAttribute("date");
				allDates[i].innerHTML = LeftDate(date);
			}
			var allDates = document.getElementsByName("date");
			for (let i = 0; i < allDates.length; i++) {
				var date = allDates[i].getAttribute("date");
				if (date !== undefined && date !== "") {
					allDates[i].innerHTML = LeftDateSmall(date);
				}
			}
		} catch (error) {}
	}

	async function VoteIdees() {
		try {
			await sendTransaction(contract.create_goal_ideas_vote(Number(goalId), Number(id), window.ethereum.selectedAddress));
		} catch (error) {
			console.error(error);
			return;
		}
		window.location.reload();
	}

	async function DonateToAddress() {
		setDonatemodalShow(true);
	}
	function Loader({element, type = "rectangular", width = "50", height = "23"}) {
		if (running) {
			return <Skeleton variant={type} width={width} height={height} />;
		} else {
			return element;
		}
	}
	async function removeElementFromArrayBYID(all, specificid, seting) {
		seting([]);
		var storing = [];
		for (let index = 0; index < all.length; index++) {
			const element = all[index];
			if (element.id == specificid) {
				continue;
			}
			storing.push(element);
		}

		seting(storing);
	}

	async function PostCommentSubsocial(e) {
		e.preventDefault();
		const ideaURI = JSON.parse(await contract.ideas_uri(Number(ideaId)).call()); //Getting current Idea URI for post ID
		await createComment(Number(ideaURI.properties.postid), Comment,saveMessageSubsocial);
	}
	async function saveMessageSubsocial(CommentId) {
		CommentsList.push({
			replies: [],
			address: window.ethereum.selectedAddress,
			message: Comment,
			date: new Date().toISOString(),
			id: CommentId
		});

		setComment("");
		removeElementFromArrayBYID(emptydata, 0, setemptydata);
		console.log("Saved Messages");
	}

	// async function PostCommentInWormhole(e) {
	// 	e.preventDefault();
	// 	CommentsList.push({
	// 		replies: [],
	// 		address: window.ethereum.selectedAddress,
	// 		message: Comment,
	// 		date: new Date().toISOString(),
	// 		id: CommentsList.length
	// 	});
	// 	await saveMessage();
	// 	setComment("");
	// 	removeElementFromArrayBYID(emptydata, 0, setemptydata);
	// }
	// async function saveMessage() {
	// 	await sendMessage(Number(window.ethereum.networkVersion), Number(ideaId), JSON.stringify(CommentsList));
	// 	removeElementFromArrayBYID(emptydata, 0, setemptydata);
	// 	console.log("Saved Messages");
	// }

	return (
		<>
			<Head>
				<title>{IdeasURI.Title}</title>
				<meta name="description" content={IdeasURI.Title} />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Header></Header>
			<div className={`${styles.container} flex flex-col items-center gap-8`}>
				<div className={`${styles.title} flex flex-col gap-2`}>
					<div style={{position: "relative"}}>
						<Loader
							element={
								<h1 className={`text-moon-32 font-bold pb-2`} style={{width: "78%"}}>
									{IdeasURI.Title}
								</h1>
							}
							width={"80%"}
						/>
						<a
							style={{width: "135px", position: "absolute", right: "0rem", top: "0"}}
							onClick={() => {
								window.history.back();
							}}
						>
							<Button iconleft style={{width: "135px"}}>
								<ControlsChevronLeft />
								Back
							</Button>
						</a>
					</div>
					<div>
						<Loader
							element={
								<a className="font-medium " href={`https://moonbase.moonscan.io/address/${IdeasURI.wallet}`} style={{color:"var(--title-a-text)"}} rel="noreferrer" target="_blank">
									{IdeasURI.wallet}
								</a>
							}
							width={"80%"}
						/>
					</div>
					<Loader
						element={
							<a  name="dateleft"   date={IdeasURI.End_Date}>
								{LeftDate(IdeasURI.End_Date)}
							</a>
						}
						width={"80%"}
					/>

					<Loader
						element={
							<div className="flex" >
								Voted: {IdeasURI.voted}{" "}
							</div>
						}
						width={"100%"}
					/>
					<Loader
						element={
							<div className="flex" >
								Donated: {IdeasURI.donation}{" "}
							</div>
						}
						width={"100%"}
					/>
					<Loader element={<p >{IdeasURI.Description} </p>} width={"100%"} />
				</div>
				<div className={`${styles.tabtitle} flex gap-4 justify-start`}>
					<a className={`tab block cursor-pointer py-2 text-3xl text-[#e2107b]`} style={{color:"var(--title-a-text)"}}>Ideas</a>
					<div className="flex justify-end w-full gap-4">
						{!IdeasURI.isVoted ? (
							<>
								<Button
									data-element-id="btn_vote"
									style={{width: "135px"}}
									data-analytic-event-listener="true"
									onClick={() => {
										VoteIdees();
									}}
								>
									Vote
								</Button>
							</>
						) : (
							<></>
						)}

						<Button
							data-element-id="btn_donate"
							style={{width: "135px"}}
							data-analytic-event-listener="true"
							onClick={() => {
								DonateToAddress();
							}}
						>
							Donate
						</Button>
					</div>
				</div>
				<div className={styles.divider}></div>
				<>
					<div className={`flex gap-8`}>
						<Loader
							type="rounded"
							element={
								imageList.length > 1 ? (
									<>
										<SlideShow className={styles.slideshow} images={imageList} />
									</>
								) : (
									<>
										<div className="flex-1 rounded-xl overflow-hidden flex" style={{height: "500px"}}>
											<img type={imageList[0]?.type} src={imageList[0]?.url} alt="" />
										</div>
									</>
								)
							}
							width={750}
							height={500}
						/>
					</div>
				</>
			</div>
			<div style={{padding: "4% 10%", display: "flex", justifyContent: "center"}}>
				<form onSubmit={PostCommentSubsocial} style={{width: "60rem", display: "flex", flexDirection: "column", rowGap: "1rem"}}>
					{CommentInput}
					<div style={{display: "flex", justifyContent: "flex-end"}}>
						<Button data-element-id="btn_donate" style={{width: "135px"}} data-analytic-event-listener="true" type="submit">
							Post Comment
						</Button>
					</div>
				</form>
			</div>

			<div style={{padding: "0 10%", display: "flex", justifyContent: "center"}}>
				<div style={{width: "60rem", height: "100%"}}>
					{CommentsList.map((listItem, index) =>
						listItem.address !== "" ? <CommentBox postid={IdeasURI.postid} commentid={listItem.id} address={listItem.address} date={listItem.date}  message={listItem.message} replies={listItem.replies} id={listItem.id} key={listItem.id} /> : <></>
					)}
				</div>
			</div>

			<DonateCoin
				ideasid={ideaId}
				show={DonatemodalShow}
				onHide={() => {
					setDonatemodalShow(false);
				}}
				address={AccountAddress}
			/>
		</>
	);
}

