import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { RefreshCw, Download, CheckCircle, Sparkles, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { appUpdateService, UpdateInfo } from '../services/appUpdateService';

interface AppUpdateManagerProps {
  lang: AppLanguage;
  showInlineButton?: boolean;
}

export const AppUpdateManager: React.FC<AppUpdateManagerProps> = ({
  lang,
  showInlineButton = false,
}) => {
  const isFr = lang === 'fr';
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(appUpdateService.getLatestInfo());
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to AppUpdateService
    const unsubscribe = appUpdateService.subscribe((info) => {
      setUpdateInfo(info);
      if (info.forceUpdate) {
        setIsDismissed(false); // Never dismiss force updates
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    setStatusMessage(null);

    const info = await appUpdateService.checkRemoteVersionManifest(true);

    setTimeout(() => {
      setIsChecking(false);
      if (info.updateAvailable) {
        setStatusMessage(
          isFr
            ? `Nouvelle version v${info.newVersion} disponible !`
            : `New version v${info.newVersion} available!`
        );
      } else {
        setStatusMessage(
          isFr
            ? `DegreeUnlocker est à jour (v${info.currentVersion})`
            : `DegreeUnlocker is up to date (v${info.currentVersion})`
        );
      }

      setTimeout(() => setStatusMessage(null), 4000);
    }, 600);
  };

  const handleApplyUpdate = () => {
    appUpdateService.applyUpdate(updateInfo.newVersion);
  };

  return (
    <>
      {/* Inline Trigger Button for Headers / Menus */}
      {showInlineButton && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title={
              isFr
                ? "Vérifier la version et chercher des mises à jour"
                : "Check application version & remote updates"
            }
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-400 ${
                isChecking ? 'animate-spin text-amber-400' : ''
              }`}
            />
            <span>
              {isChecking
                ? isFr
                  ? 'Vérification...'
                  : 'Checking...'
                : isFr
                ? 'Mise à jour'
                : 'Check Updates'}
            </span>
          </button>

          {statusMessage && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </span>
          )}
        </div>
      )}

      {/* Non-Intrusive "New Version Available" Toast / Notification */}
      {updateInfo.updateAvailable && (!isDismissed || updateInfo.forceUpdate) && (
        <div
          className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-md w-full p-4 rounded-2xl border shadow-2xl text-white animate-in slide-in-from-bottom duration-300 ${
            updateInfo.forceUpdate
              ? 'bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border-red-500/60 shadow-red-950/50'
              : 'bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border-indigo-400/50 shadow-indigo-950/50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                  updateInfo.forceUpdate
                    ? 'bg-red-500/20 border-red-400/40 text-red-400'
                    : 'bg-indigo-600/30 border-indigo-400/40 text-amber-300'
                }`}
              >
                {updateInfo.forceUpdate ? (
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                ) : (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">
                    {updateInfo.forceUpdate
                      ? isFr
                        ? 'Mise à jour critique requise'
                        : 'Critical Update Required'
                      : isFr
                      ? 'Nouvelle Version Disponible !'
                      : 'New Version Available!'}
                  </h4>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                      updateInfo.forceUpdate
                        ? 'bg-red-500/20 text-red-300 border-red-500/30 font-bold'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    v{updateInfo.newVersion || '3.2.1'}
                  </span>
                </div>
                <p className="text-xs text-indigo-200/90 leading-snug">
                  {updateInfo.changelog ||
                    (isFr
                      ? 'Une nouvelle version avec correctifs et performances améliorées est prête.'
                      : 'A new version with performance enhancements is ready.')}
                </p>
              </div>
            </div>

            {!updateInfo.forceUpdate && (
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title={isFr ? 'Ignorer' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {isFr
                  ? 'Rechargement instantané sans quitter la page'
                  : 'Instant reload without leaving app'}
              </span>
            </div>

            <button
              onClick={handleApplyUpdate}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                updateInfo.forceUpdate
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950'
              }`}
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isFr ? 'RECHARGER & METTRE À JOUR' : 'UPDATE & RELOAD'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
