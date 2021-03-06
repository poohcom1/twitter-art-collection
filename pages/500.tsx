import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ErrorScene } from "src/components";

export default function Error() {
  const router = useRouter();

  const [error, setError] = useState("Server error :(");

  useEffect(() => {
    if (router.query.message) setError(router.query.message as string);
  }, [router.query.message]);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      <ErrorScene errorText={error} />
    </>
  );
}
