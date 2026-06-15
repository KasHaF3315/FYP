import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initNativeApp } from "./lib/initNative";
import "./styles/index.css";

initNativeApp().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});