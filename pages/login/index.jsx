'use client';
import React, { useState, useEffect } from "react";
import { Header } from "../../components/layout/Header";
import Head from "next/head";
import styles from "./Login.module.scss";
import Button  from "@heathmont/moon-core-tw/lib/button/Button";
import GenericCheckRounded  from "@heathmont/moon-icons-tw/lib/icons/GenericCheckRounded";
import GenericClose  from "@heathmont/moon-icons-tw/lib/icons/GenericClose";
import isServer from "../../components/isServer";
import { usePolkadotContext } from "../../contexts/PolkadotContext";

let redirecting = "";
export default function Login() {
  const {ConnectPolkadot} = usePolkadotContext()

  if (!isServer()) {
    const regex = /\[(.*)\]/g;
    const str = decodeURIComponent(window.location.search);
    let m;

    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      redirecting = m[1];
    }
  }


  useEffect(() => {
    if (!isServer()) {
      setInterval(() => {
        if ( window.localStorage.getItem("login-type") == "Metamask" && window.localStorage.getItem("login-type2") == "Polkadot" &&  window.localStorage.getItem("loggedin") == "true" ) {
          window.location.href = redirecting;
        }
      }, 1000);
    }
  }, []);
  if (isServer()) return null;


  function MetamaskWallet() {
    if (!isServer()) {
    if (window.ethereum == null  |window.ethereum == "undefined") {
      return (
        <>
          <div className="border flex gap-6 items-center p-2 w-full " style={{borderRadius: '1rem'}}>
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
                <img src="https://metamask.io/images/metamask-logo.png" />
            </div>
            <div className="flex flex-1 flex-col">
            <span className="font-bold">Metamask wallet</span>
           
            </div>
            <Button onClick={onClickConnect} style={{ width: 148 }}>
              Install Metamask
            </Button>
          </div>
        </>
      );
    }
    if (window.localStorage.getItem("login-type") !== "Metamask") {
      return (
        <>
          <div className="border flex gap-6 items-center p-2 w-full" style={{borderRadius: '1rem'}}>
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
                <img src="https://metamask.io/images/metamask-logo.png" />
            </div>
            <div className="flex flex-1 flex-col">
            <span className="font-bold">Metamask wallet</span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#FF4E64" }}
              >
                <GenericClose
                  className="text-moon-32"
                  color="#FF4E64"
                ></GenericClose>
                Disconnected
              </span>
            </div>
            <Button onClick={onClickConnect} style={{ width: 112 }}>
              Connect
            </Button>
          </div>
        </>
      );
    }
    if ( window.localStorage.getItem("login-type") == "Metamask") {
      return (
        <>
          <div className="border flex gap-6 items-center p-2 w-full " style={{borderRadius: '1rem'}}>
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
              <img src="https://metamask.io/images/metamask-logo.png" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-bold">Metamask wallet</span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#40A69F" }}
              >
                <GenericCheckRounded
                  className="text-moon-32"
                  color="#40A69F"
                ></GenericCheckRounded>
                Connected
              </span>
            </div>
            <Button
              onClick={onClickDisConnect}
              variant="secondary"
              style={{ width: 112 }}
            >
              Disconnect
            </Button>
          </div>
        </>
      );
    }}
  }
  async function onClickConnect() {
    let result = await window.ethereum.request({ method: 'eth_requestAccounts' });
    result;
    try {
        const getacc = await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x507', }], //1287
        });
        getacc;
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0x507', //1287
                            chainName: 'Moonbeam Alpha',
                            nativeCurrency: {
                                name: 'DEV',
                                symbol: 'DEV',
                                decimals: 18,
                            },
                            rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
                        },
                    ],
                });
            } catch (addError) {
                // handle "add" error
                console.log(addError);
            }
        }
        // handle other "switch" errors
    }

    window.localStorage.setItem('loggedin', 'true')
    window.localStorage.setItem('login-type', "Metamask");
    
    window.location.reload();
  }
  async function onClickDisConnect() {
    window.localStorage.setItem('loggedin', 'false')
    window.localStorage.setItem('login-type', "");
  }

  

  function PolkadotWallet() {
    if (!isServer()) {
    if (window.injectedWeb3 == null | window.injectedWeb3 =="undefined") {
      return (
        <>
          <div className="border flex gap-6 items-center p-2 w-full" style={{borderRadius: '1rem'}}>
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
                <img src="https://polkadot.js.org/logo.svg" />
            </div>
            <div className="flex flex-1 flex-col">
            <span className="font-bold">Polkadot.js wallet</span>
           
            </div>
            <Button onClick={onClickConnectPolkadot} style={{ width: 148 }}>
              Install Polkadot.js
            </Button>
          </div>
        </>
      );
    }
    if (window.localStorage.getItem("login-type2") !== "Polkadot") {
      return (
        <>
          <div className="border flex gap-6 items-center p-2 w-full" style={{borderRadius: '1rem'}}>
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
                <img src="https://polkadot.js.org/logo.svg" />
            </div>
            <div className="flex flex-1 flex-col">
            <span className="font-bold">Polkadot.js wallet</span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#FF4E64" }}
              >
                <GenericClose
                  className="text-moon-32"
                  color="#FF4E64"
                ></GenericClose>
                Disconnected
              </span>
            </div>
            <Button onClick={onClickConnectPolkadot} style={{ width: 112 }}>
              Connect
            </Button>
          </div>
        </>
      );
    }
    if ( window.localStorage.getItem("login-type2") == "Polkadot") {
      return (
        <>
          <div className="border flex gap-6 items-center p-2 w-full " style={{borderRadius: '1rem'}}>
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
              <img src="https://polkadot.js.org/logo.svg" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-bold">Polkadot.js wallet</span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#40A69F" }}
              >
                <GenericCheckRounded
                  className="text-moon-32"
                  color="#40A69F"
                ></GenericCheckRounded>
                Connected
              </span>
            </div>
            <Button
              onClick={onClickDisConnectPolkadot}
              variant="secondary"
              style={{ width: 112 }}
            >
              Disconnect
            </Button>
          </div>
        </>
      );
    }}
  }

  
  async function onClickConnectPolkadot() {
      await ConnectPolkadot();
      window.location.reload();
  }
  async function onClickDisConnectPolkadot() {
    window.localStorage.setItem('loggedin', 'false')
    window.localStorage.setItem('login-type2', "");
  }


  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="AmazingGreen - Login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <div className={`${styles.container} flex items-center flex-col gap-8`}>
      <div className={`${styles.title} flex flex-col`}>
          <h1 className="text-moon-32 font-bold" style={{color: '#44A09F'}}>Login to your account</h1>
          <p className="mt-4 text-trunks">Please connect to your Metamask and Polkadot.js wallet in order to login.</p>
          <p className="text-trunks">You can use one of these networks:</p>
          <p className="text-trunks">Metamask: Moonbase alpha(Default), Celo Alfajore(Metamask), BNB, Goerli Test Network</p>
          <p className="text-trunks">Polkadot.js: Subsocial</p>
        </div>
        <div className={styles.divider}></div>
        <div className={`${styles.title} flex flex-col items-center gap-8`}>
          <MetamaskWallet />
          <PolkadotWallet/>
        </div>

      </div>
    </>
  );
}
