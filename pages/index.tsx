import Main from "../src/scenes/Main/Main";
import "react-static-tweets/styles.css";
import Head from "next/head";

export default function Index() {
  fetch("/api/setup")
    .then(() => console.log("Setup ok!"))
    .catch((err) => console.log("[Setup error] " + err));
  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>{" "}
      <Main />
    </>
  );
}
