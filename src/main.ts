import "./styles.css";
import { startApp } from "./app";
import { initPwa } from "./pwa";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("App root not found.");
}

startApp(root);
initPwa();
