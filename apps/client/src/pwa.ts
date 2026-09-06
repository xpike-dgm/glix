import { Workbox } from "workbox-window";

export interface PwaManager {
  readonly hasUpdate: boolean;
  readonly isOffline: boolean;
  readonly update: () => Promise<void>;
  readonly subscribe: (listener: () => void) => () => void;
}

const RELOAD_GUARD_KEY = "glix:sw-reloaded";

class PwaService {
  private wb: Workbox | null = null;
  private hasUpdateState = false;
  private isOfflineState = typeof navigator !== "undefined" ? !navigator.onLine : false;
  private listeners = new Set<() => void>();
  private isReloading = false;

  constructor() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOfflineState = false;
      this.notify();
    });

    window.addEventListener("offline", () => {
      this.isOfflineState = true;
      this.notify();
    });

    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      this.wb = new Workbox("/sw.js");

      this.wb.addEventListener("waiting", () => {
        this.hasUpdateState = true;
        this.notify();
      });

      this.wb.addEventListener("controlling", () => {
        if (this.isReloading) return;
        const alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === "true";
        if (!alreadyReloaded) {
          this.isReloading = true;
          sessionStorage.setItem(RELOAD_GUARD_KEY, "true");
          window.location.reload();
        }
      });

      // Clear reload guard once page successfully boots
      window.addEventListener("load", () => {
        setTimeout(() => {
          sessionStorage.removeItem(RELOAD_GUARD_KEY);
        }, 3000);
      });

      this.wb.register().catch((err) => {
        console.warn("[GLIX-PWA] Service worker registration failed:", err);
      });
    }
  }

  get hasUpdate(): boolean {
    return this.hasUpdateState;
  }

  get isOffline(): boolean {
    return this.isOfflineState;
  }

  async update(): Promise<void> {
    if (!this.wb) {
      window.location.reload();
      return;
    }

    if (this.hasUpdateState) {
      this.isReloading = true;
      sessionStorage.setItem(RELOAD_GUARD_KEY, "true");
      await this.wb.messageSkipWaiting();
      return;
    }

    // Explicitly check for updates on server
    try {
      await this.wb.update();
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg?.waiting) {
        this.isReloading = true;
        sessionStorage.setItem(RELOAD_GUARD_KEY, "true");
        await this.wb.messageSkipWaiting();
        return;
      }
    } catch {
      // Fallback reload if update check fails
    }

    window.location.reload();
  }

  triggerChunkLoadRecovery(): void {
    console.warn("[GLIX-PWA] Chunk load failure detected. Triggering update check.");
    this.hasUpdateState = true;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const pwaService = new PwaService();
