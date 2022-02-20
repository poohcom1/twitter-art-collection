import Head from "next/head";
import "react-static-tweets/styles.css";
import { useState } from "react";
import { Main, LoadingScene } from "../src/scenes";

export default function Index() {
  const [setup, setSetup] = useState(false);

  if (!setup) {
    fetch("/api/setup")
      .then(() => {
        setSetup(true);
        console.log("Setup ok!");
      })
      .catch((err) => console.log("[Setup error] " + err));
  }

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>{" "}
      {setup ? <Main /> : <LoadingScene />}
    </>
  );
}
