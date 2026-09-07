import * as React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props!: Props;
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);

    // Auto-recover from stale ServiceWorker or Vite chunk import failures
    if (
      error &&
      typeof error.message === 'string' &&
      (error.message.includes('Failed to fetch dynamically imported module') ||
       error.message.includes('Importing a module script failed'))
    ) {
      if (!sessionStorage.getItem('auto_reload_on_chunk_error')) {
        sessionStorage.setItem('auto_reload_on_chunk_error', '1');
        if ('caches' in window) {
          caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).finally(() => {
            (window as any).location.reload();
          });
        } else {
          (window as any).location.reload();
        }
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-slate-800 dark:text-slate-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ⚠️
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight">Oups ! Une erreur est survenue</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                L'application a rencontré un incident inattendu. Vos données locales sont en sécurité. Veuillez recharger la page pour reprendre.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-mono text-rose-600 dark:text-rose-400 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={async () => {
                  try {
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((k) => caches.delete(k)));
                    }
                  } catch (e) {
                    console.warn(e);
                  } finally {
                    window.location.reload();
                  }
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Recharger l'application
              </button>
              <button
                onClick={async () => {
                  try {
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (const r of regs) await r.unregister();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((k) => caches.delete(k)));
                    }
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {
                    console.warn(e);
                  } finally {
                    window.location.reload();
                  }
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Effacer le cache & Réinitialiser
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
