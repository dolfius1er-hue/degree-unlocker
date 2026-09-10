export interface VersionManifest {
  version: string;
  forceUpdate?: boolean;
  buildTime?: string;
  appName?: string;
  changelog?: string;
}

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  newVersion?: string;
  changelog?: string;
  forceUpdate?: boolean;
  isServiceWorkerWaiting?: boolean;
  lastChecked?: number;
}

type UpdateListener = (info: UpdateInfo) => void;

// Current runtime application version constant
export const CURRENT_APP_VERSION = '6.5.0';

class AppUpdateService {
  private currentVersion: string = CURRENT_APP_VERSION;
  private listeners: Set<UpdateListener> = new Set();
  private registration: ServiceWorkerRegistration | null = null;
  private lastETag: string | null = null;

  private latestUpdateInfo: UpdateInfo = {
    updateAvailable: false,
    currentVersion: CURRENT_APP_VERSION,
    forceUpdate: false,
  };

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Retrieve or initialize saved version in localStorage
    const savedVer = localStorage.getItem('app_installed_version');
    if (savedVer) {
      this.currentVersion = savedVer;
    } else {
      this.currentVersion = CURRENT_APP_VERSION;
      localStorage.setItem('app_installed_version', CURRENT_APP_VERSION);
    }

    // Retrieve cached ETag if available
    this.lastETag = localStorage.getItem('app_version_etag');

    this.latestUpdateInfo.currentVersion = this.currentVersion;

    // Register SW event handlers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          this.registration = reg;

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.checkRemoteVersionManifest(true);
                }
              };
            }
          };
        }
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // Perform single HEAD request check on application launch
    this.checkRemoteVersionManifestOnLaunch();
  }

  /**
   * Single HEAD check executed on launch.
   * Compares the ETag header and version manifest against stored localStorage values.
   */
  public async checkRemoteVersionManifestOnLaunch(): Promise<UpdateInfo> {
    const now = Date.now();
    localStorage.setItem('app_last_checked_timestamp', now.toString());
    return this.checkRemoteVersionManifest();
  }

  public async checkRemoteVersionManifest(forceFetchGet = false): Promise<UpdateInfo> {
    try {
      if (this.registration) {
        await this.registration.update().catch(() => {});
      }

      const timestamp = Date.now();
      let hasHeaderChanged = false;
      let fetchedETag: string | null = null;

      // 1. Single lightweight HEAD request on launch to fetch ETag or Last-Modified header
      try {
        const headRes = await fetch(`/version.json?t=${timestamp}`, {
          method: 'HEAD',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (headRes.ok) {
          fetchedETag = headRes.headers.get('etag') || headRes.headers.get('last-modified');
          
          if (fetchedETag && fetchedETag !== this.lastETag) {
            hasHeaderChanged = true;
          } else if (!this.lastETag) {
            hasHeaderChanged = true;
          }
        } else {
          hasHeaderChanged = true; // Fallback to GET if HEAD not supported
        }
      } catch {
        hasHeaderChanged = true; // Fallback on error
      }

      // If ETag hasn't changed from stored value and GET is not forced, no update needed
      if (!hasHeaderChanged && !forceFetchGet) {
        const info: UpdateInfo = {
          updateAvailable: false,
          currentVersion: this.currentVersion,
          forceUpdate: false,
          lastChecked: timestamp,
        };
        this.latestUpdateInfo = info;
        this.emit(info);
        return info;
      }

      // 2. Fetch version.json via GET only when ETag/header changed or forced
      const res = await fetch(`/version.json?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const manifest: VersionManifest = await res.json();
        
        // Save new ETag into localStorage
        if (fetchedETag) {
          this.lastETag = fetchedETag;
          localStorage.setItem('app_version_etag', fetchedETag);
        }

        // Compare remote version against stored version
        const isNewer = this.isVersionNewer(manifest.version, this.currentVersion);
        const isForceUpdate = !!manifest.forceUpdate;

        if (isNewer || isForceUpdate) {
          return this.notifyUpdateAvailable(
            this.currentVersion,
            manifest.version,
            manifest.changelog,
            isForceUpdate,
            !!(this.registration && this.registration.waiting)
          );
        }
      }
    } catch (err) {
      console.warn('[AppUpdateService] Launch check error:', err);
    }

    const info: UpdateInfo = {
      updateAvailable: false,
      currentVersion: this.currentVersion,
      forceUpdate: false,
      lastChecked: Date.now(),
    };
    this.latestUpdateInfo = info;
    this.emit(info);
    return info;
  }

  public isVersionNewer(remote: string, current: string): boolean {
    if (!remote || !current) return false;
    const parse = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
    const r = parse(remote);
    const c = parse(current);

    for (let i = 0; i < Math.max(r.length, c.length); i++) {
      const rv = r[i] || 0;
      const cv = c[i] || 0;
      if (rv > cv) return true;
      if (rv < cv) return false;
    }
    return false;
  }

  private notifyUpdateAvailable(
    current: string,
    newVer: string,
    changelog?: string,
    forceUpdate?: boolean,
    swWaiting?: boolean
  ): UpdateInfo {
    const info: UpdateInfo = {
      updateAvailable: true,
      currentVersion: current,
      newVersion: newVer,
      changelog: changelog || 'New features and stability enhancements.',
      forceUpdate: !!forceUpdate,
      isServiceWorkerWaiting: swWaiting,
      lastChecked: Date.now(),
    };
    this.latestUpdateInfo = info;
    this.emit(info);
    return info;
  }

  public subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    listener(this.latestUpdateInfo);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(info: UpdateInfo) {
    this.listeners.forEach((fn) => fn(info));
  }

  public applyUpdate(newVersion?: string) {
    const targetVer = newVersion || this.latestUpdateInfo.newVersion || CURRENT_APP_VERSION;
    localStorage.setItem('app_installed_version', targetVer);

    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    window.location.reload();
  }

  public getLatestInfo(): UpdateInfo {
    return this.latestUpdateInfo;
  }
}

export const appUpdateService = new AppUpdateService();
