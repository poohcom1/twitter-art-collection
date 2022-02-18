import Main from "../src/scenes/Main/Main";
import "react-static-tweets/styles.css";
import Head from "next/head";
import { useState } from "react";

export default function Index() {
  const [setup, setSetup] = useState(false);

  if (!setup) {
    setSetup(true);
    fetch("/api/setup")
      .then(() => console.log("Setup ok!"))
      .catch((err) => console.log("[Setup error] " + err));
  }

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>{" "}
      <Main />
    </>
  );
}
