import Head from "next/head";
import { ErrorScene } from "src/components";

export default function Error() {
  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      <ErrorScene
        headingText=""
        errorText={"404 | This page could not be found."}
      />
    </>
  );
}
