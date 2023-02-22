"use client";
import {useContext, useEffect, useState} from "react";
import {createContext} from "react";
import {idToBn} from "@subsocial/utils";
import {IpfsContent} from "@subsocial/api/substrate/wrappers";
import {useSnackbar} from "notistack";
import { getNewIdsFromEvent } from '@subsocial/api'

const AppContext = createContext({
	ConnectPolkadot: async () => {},
	createSpace: async () => {},
	createPost: async () => {},
	createComment: async () => {},
	createReply: async () => {},
	getCommentForAPost: async () => {},
	api: null,
	status: false
});

export const Testnet = {
	substrateNodeUrl: "wss://rco-para.subsocial.network",
	ipfsNodeUrl: "https://gw.crustfiles.app"
};

export function PolkadotProvider({children}) {
	const {enqueueSnackbar} = useSnackbar();
	const [api, setApi] = useState(null);
	const [status, setStatus] = useState(false);
	const [isWeb3Injected2, setisWeb3Injected] = useState(false);
	const [signerUser, setSigner] = useState(null);
	const [signerAddress, setSignerAddress] = useState(null);

	async function ShowToast(result, type, callback) {
		const {status} = result;

		if (!result || !status) {
			return;
		}
		if (status.isFinalized) {
			const blockHash = status.isFinalized ? status.asFinalized : status.asInBlock;
			console.log("Tx finalized. Block hash", blockHash.toString());
			const newIds = getNewIdsFromEvent(result); // get first argument from array.
			enqueueSnackbar(`Successfully created ${type}. ID-` + Number(newIds), {variant: "success"});
			await callback(newIds);
		} else if (result.isError) {
			console.log(JSON.stringify(result));
		} else {
			enqueueSnackbar(`⏱ Current ${type} tx status: ${status.type}`, {variant: "info"});
			console.log("⏱ Current tx status:", status.type);
		}
	}
	// Creating a space on Subsocial network.
	async function createSpace(Callback) {
		enqueueSnackbar("Creating space in Subsocial...", {variant: "info"});

		const cid = await api.ipfs.saveContent({
			name: "Subsocial",
			tags: ["subsocial"]
		});
		const substrateApi = await api.blockchain.api;

		const spaceTransaction = substrateApi.tx.spaces.createSpace(
			IpfsContent(cid),
			null // Permissions config (optional)
		);

		await spaceTransaction.signAsync(signerAddress,{signerUser})
		await spaceTransaction.send( (e) => {
			ShowToast(e, "space", Callback);
		});
	}

	// Creating a post on Subsocial network.
	async function createPost(SpaceId, Callback) {
		enqueueSnackbar("Creating post in Subsocial...", {variant: "info"});

		const cid = await api.ipfs.saveContent({
			name: "Subsocial",
			tags: ["subsocial"]
		});
		const substrateApi = await api.blockchain.api;

		const Transaction = substrateApi.tx.posts.createPost(SpaceId, {RegularPost: null}, IpfsContent(cid));
		
		await Transaction.signAsync(signerAddress,{signerUser})
		await Transaction.send( (e) => {
			ShowToast(e, "post", Callback);
		});
	}

	// Creating a comment on Subsocial network.
	async function createComment(postid, commentsText, callback) {
		if (isNaN(postid)) postid = 104;
		enqueueSnackbar("Creating comment in Subsocial...", {variant: "info"});

		const cid = await api.ipfs.saveContent({
			body: commentsText,
			address: window.ethereum.selectedAddress,
			date: new Date().toISOString()
		});

		const substrateApi = await api.blockchain.api;

		const Transaction = substrateApi.tx.posts.createPost(null, {Comment: {parentId: null, rootPostId: postid}}, IpfsContent(cid));

		await Transaction.signAsync(signerAddress,{signerUser})
		await Transaction.send( (e) => {
			ShowToast(e, "comment", callback);
		});
	}


	// Creating a reply to a comment on Subsocial network.
	async function createReply(postid, commentid, replyText, callback) {
		if (isNaN(postid)) postid = 104;
		enqueueSnackbar("Creating reply in Subsocial...", {variant: "info"});

		const cid = await api.ipfs.saveContent({
			body: replyText,
			address: window.ethereum.selectedAddress,
			date: new Date().toISOString()
		});

		const substrateApi = await api.blockchain.api;

		const Transaction = substrateApi.tx.posts.createPost(null, {Comment: {parentId: commentid, rootPostId: postid}}, IpfsContent(cid));

		await Transaction.signAsync(signerAddress,{signerUser})
		await Transaction.send( (e) => {
			ShowToast(e, "reply", callback);
		});
	}

	// Get comments of a post/Idea from Subsocial network.
	async function getCommentForAPost(postid) {
		if (isNaN(postid) ) postid = 104;
		const substrate = api.blockchain;

		// Get reply ids (comments) by parent post id and fetch posts by ids
		const replyIds = await substrate.getReplyIdsByPostId(idToBn(postid));

		// For getting comments use posts functions
		const replies = await api.findPublicPosts(replyIds);
		let commentlist = [];
		for (let i = 0; i < replies.length; i++) {
			let comment = replies[i];
			let commentText = comment.content.body;
			let date = comment.content.date;
			let address = comment.content.address;
			let allReplies = await getRepliesByCommentid(comment.id);
			commentlist.push({
				id: comment.id,
				message: commentText,
				address: address,
				date: date?? new Date().toISOString(),
				replies: allReplies
			});
		}
		return commentlist;
	}


	// Get comments of a post/Idea from Subsocial network.
	async function getRepliesByCommentid(commentid) {
		if (isNaN(commentid) ) commentid = 105;
		const substrate = api.blockchain;

		// Get reply ids (comments) by parent id and fetch posts by ids
		const replyIds = await substrate.getReplyIdsByPostId(idToBn(commentid));

		// For getting comments use posts functions
		const replies = await api.findPublicPosts(replyIds);
		let replylist = [];
		for (let i = 0; i < replies.length; i++) {
			let reply = replies[i];
			let replyText = reply.content.body;
			let date = reply.content.date;
			let address = reply.content.address;
			replylist.push({
				id: reply.id,
				message: replyText,
				address: address,
				date: date?? new Date().toISOString()
			});
		}
		return replylist;
	}

	async function EnablePolkadot() {
		const {SubsocialApi} = await import("@subsocial/api");

		const {waitReady} = await import("@polkadot/wasm-crypto");

		const polkadot = await import("@polkadot/extension-dapp");
		const {isWeb3Injected, web3Enable, web3Accounts, web3FromAddress} = polkadot;
		await web3Enable("AmazingGreen");

		await waitReady();
		setisWeb3Injected(isWeb3Injected);
		const newApi = await SubsocialApi.create(Testnet);
		newApi.ipfs.setWriteHeaders({
			authorization:
				"Basic " +
				"c3ViLTVGQTluUURWZzI2N0RFZDhtMVp5cFhMQm52TjdTRnhZd1Y3bmRxU1lHaU45VFRwdToweDEwMmQ3ZmJhYWQwZGUwNzFjNDFmM2NjYzQzYmQ0NzIxNzFkZGFiYWM0MzEzZTc5YTY3ZWExOWM0OWFlNjgyZjY0YWUxMmRlY2YyNzhjNTEwZGY4YzZjZTZhYzdlZTEwNzY2N2YzYTBjZjM5OGUxN2VhMzAyMmRkNmEyYjc1OTBi"
		});
		await newApi.isReady;
		const accounts = await web3Accounts();
		const address = accounts[0].address;
		const {signer} = await web3FromAddress(address);
		newApi.blockchain._api.setSigner(signer);

		setApi(newApi);
		setSigner(signer);
		setSignerAddress(address);
		setStatus(true);
	}

	async function initializePolkadot() {
		if (window.localStorage.getItem("login-type2") == "Polkadot") {
			EnablePolkadot();
		}
	}

	async function ConnectPolkadot() {
		await EnablePolkadot();
		window.localStorage.setItem("login-type2", "Polkadot");
	}

	useEffect(() => {
		initializePolkadot();
	}, []);
	return (
		<AppContext.Provider value={{ConnectPolkadot: ConnectPolkadot, createSpace: createSpace, createPost: createPost, createComment: createComment, createReply:createReply, getCommentForAPost: getCommentForAPost, api: api, status: status}}>
			{" "}
			{children}
		</AppContext.Provider>
	);
}

export const usePolkadotContext = () => useContext(AppContext);
