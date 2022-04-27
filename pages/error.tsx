import Head from "next/head";
import { ErrorScene } from "src/scenes";

export default function Error() {
  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      <ErrorScene />
    </>
  );
}
