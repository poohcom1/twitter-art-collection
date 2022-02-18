import App from "../src/App";
import "react-static-tweets/styles.css";

export default function Index() {
  fetch("/api/setup")
    .then(() => console.log("Setup ok!"))
    .catch((err) => console.log("[Setup error] " + err));
  return <App />;
}
