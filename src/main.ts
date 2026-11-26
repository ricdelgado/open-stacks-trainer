import "./styles.css";
import { registerSW } from "virtual:pwa-register";
import { startApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("App root not found.");
}

startApp(root);

if (import.meta.env.PROD) {
  try {
    registerSW({ immediate: true });
  } catch {
    // Keep the app usable online when registration is unavailable.
  }
}
