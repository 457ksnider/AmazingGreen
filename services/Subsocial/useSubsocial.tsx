import {useContext, useEffect, useState} from "react";
import { generateCrustAuthToken } from '@subsocial/api/utils/ipfs'
import polkadotjs from "./polkadotjs";
import {IpfsContent} from "@subsocial/api/substrate/wrappers";
import { Keyring }  from '@polkadot/keyring';

import { waitReady } from '@polkadot/wasm-crypto'
import { SubsocialApi } from "@subsocial/api";
import {
  CRUST_TEST_AUTH_KEY,
  CustomNetwork,
  Mainnet,
  Testnet,
} from './config'


export default function useContract() {
	const [SubsocialInstance, setSubsocialInstance] = useState({
		isReady: null,
		api: null,
    createSpace: createSpace
	})


  const [isReady, setisReady] = useState(false)
  const [api, setApi] = useState<SubsocialApi | null>(null)
  const [network, setNetwork] = useState<CustomNetwork>(getStoredNetwork())
  
  

  function getStoredNetwork () {
    return Testnet
  }
  
  async function initialize  () {
    await waitReady()
    const newApi = await SubsocialApi.create(network);
  
    setApi(newApi)
    setisReady(true)
    setSubsocialInstance({
      api: newApi,
      isReady:true,
      createSpace:createSpace
    });

    // For testnet using CRUST IPFS test Mnemonic.
    if (network === Testnet) {
      // Use this ipfs object, to set authHeader for writing on Crust IPFS cluster.
      newApi.ipfs.setWriteHeaders({
        authorization: 'Basic ' + CRUST_TEST_AUTH_KEY,
      })
    }
  }
  
  useEffect(() => {
    initialize()
  }, [])

  return SubsocialInstance;

}



// Creating a space on Subsocial network.
export async function createSpace(isReady,api,aboutTXT: string, imageURLTXT: string, callback: (result: any) => void) {
  const keyring = new Keyring();
  const pair = keyring.addFromUri('//Alice');

	// Always assure, the [api] is not null using [isReady] property.
	if (!isReady || !api) {
		console.log({message: "Unable to connect to the API."});
		return;
	}

	const cid = await api.ipfs.saveContent({
		about: aboutTXT,
		image: imageURLTXT,
		name: "Subsocial",
		tags: ["subsocial"]
	});
	const substrateApi = await api.blockchain.api;

	const spaceTransaction = substrateApi.tx.spaces.createSpace(
		IpfsContent(cid),
		null // Permissions config (optional)
	);
  
  await spaceTransaction.signAndSend(pair, callback);  
}
export async function getaccountaddress(){
	const accounts = await polkadotjs.getAllAccounts();
  for (let i = 0; i < accounts.length; i++) {
    const add = accounts[i];
    console.log(add.address);
    if (!add.address.startsWith("0x")) return add.address
  }
}