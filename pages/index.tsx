import { Button } from "@heathmont/moon-core-tw";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Header } from "../components/layout/Header";
import styles from "./Home.module.scss";
declare let window: any;
export default function Welcome() {
const  section2Image = "/home/section-2-img.jpg";
const  section1Image = "/home/section-1-img.jpg";
  const router = useRouter();
  function letstartCLICK() {
    if (window.ethereum == null) {
      window.open(
        "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
        "_blank"
      );
    } else  if (window.ethereum.selectedAddress  == null || window.localStorage.getItem("ConnectedMetamask") !== "true") {
      router.push("/login?[/daos]");
    } else {
      router.push("/daos");
    }
  }

  return (
    <>
      <Head>
        <title>AmazingGreen</title>
        <meta name="description" content="AmazingGreen" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <div className={styles.section}>
        <div className={styles.text}>
          <div className={`${styles.logo} pb-4`}>
            <img src="/favicon.png" width={256} height={256}  alt="" />
          </div>
          <h1 className="text-moon-32 font-bold pt-2 pb-4">
          Empower your Community with Moonbeam
          </h1>
          <p className="py-4">
            AmazingGreen is a platform that empowers your community to take more
            control over the issues that affect you. Join AmazingGreen and read
            about the goals for your community and the funds that are available
            to reach these goals. You can add your own ideas or vote on the
            ideas of your neighbors. The most popular solutions will be implemented,
            benefitting the whole community. AmazingGreen gives everybody a vote and a voice.
          </p>
          <div className="pt-4">
            <Button onClick={letstartCLICK}>Let’s make decisions</Button>
          </div>
        </div>
        <div className={styles.image}>
          <Image src={section1Image} objectFit="cover" layout="fill" alt="" />
        </div>
      </div>
      <div className={`${styles.section} ${styles["section-dark"]}`}>
        <div className={styles.image}>
          <Image src={section2Image} objectFit="cover" layout="fill" alt="" />
        </div>
        <div className={styles.text}>
          <div className={`${styles.logo} pb-4`}>
            <img src="/favicon.png" width={256} height={256} alt="" />
          </div>
          <h1 className="text-moon-32 font-bold pb-4">Empower your Community with Moonbeam</h1>
          <p className="py-4">
          AmazingGreen is a platform that empowers your community to take more
            control over the issues that affect you. Join AmazingGreen and read
            about the goals for your community and the funds that are available
            to reach these goals. You can add your own ideas or vote on the
            ideas of your neighbors. The most popular solutions will be implemented,
            benefitting the whole community. AmazingGreen gives everybody a vote and a voice.
          </p>
          <div className="pt-4">
            <Button onClick={letstartCLICK}>Let’s make decisions</Button>
          </div>
        </div>
      </div>
    </>
  );
}
