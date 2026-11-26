import { registerSW } from "virtual:pwa-register";

type UpdateListener = () => void;

let updateAvailable = false;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
const listeners = new Set<UpdateListener>();

export function initPwa(): void {
  if (!import.meta.env.PROD) return;

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
