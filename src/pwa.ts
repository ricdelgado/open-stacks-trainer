import { registerSW } from "virtual:pwa-register";
import type { InstallPlatform } from "./domain/pwa";

type UpdateListener = () => void;

let updateAvailable = false;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
const listeners = new Set<UpdateListener>();

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallState {
  platform: InstallPlatform;
  standalone: boolean;
  promptAvailable: boolean;
}

let installInitialized = false;
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let standaloneQuery: MediaQueryList | null = null;
const installListeners = new Set<() => void>();

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  if (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches)
  );
}

function notifyInstall(): void {
  for (const listener of installListeners) listener();
}

function initInstallPrompt(): void {
  if (installInitialized) return;
  installInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    notifyInstall();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    notifyInstall();
  });

  if (typeof window.matchMedia === "function") {
    standaloneQuery = window.matchMedia("(display-mode: standalone)");
    standaloneQuery.addEventListener?.("change", notifyInstall);
  }
}

export function getInstallState(): InstallState {
  return {
    platform: detectPlatform(),
    standalone: isStandalone(),
    promptAvailable: deferredInstallPrompt !== null,
  };
}

export function subscribeToInstall(listener: () => void): () => void {
  installListeners.add(listener);
  return () => installListeners.delete(listener);
}

export async function promptInstall(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  const event = deferredInstallPrompt;
  if (!event) return "unavailable";

  deferredInstallPrompt = null;
  try {
    await event.prompt();
    const choice = await event.userChoice;
    notifyInstall();
    return choice.outcome;
  } catch {
    notifyInstall();
    return "unavailable";
  }
}

export function initPwa(): void {
  if (!import.meta.env.PROD) return;

  initInstallPrompt();

  try {
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        updateAvailable = true;
        for (const listener of listeners) listener();
      },
      onRegisterError() {
        // Keep the app usable online; no user-visible error.
      },
    });
  } catch {
    // Ignore registration failures.
  }
}

export function isUpdateAvailable(): boolean {
  return updateAvailable;
}

export function subscribeToUpdate(listener: UpdateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reloadForUpdate(): void {
  void updateSW?.(true);
}
