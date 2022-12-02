import ReactDOM from "react-dom/client";
import App from "./components/PageWrapper";
import "./index.css";

if (window === window.top) {
  window.location.href = `https://blocks.githubnext.com/?devServer=${encodeURIComponent(
    window.location.href
  )}`;
} else {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<App />);
}
