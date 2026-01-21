
import React, { useEffect, useState } from 'react';
import { User } from '../types';

declare const google: any;

interface HeaderProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, isDarkMode, onToggleDarkMode }) => {
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [copied, setCopied] = useState(false);
  const CLIENT_ID = "160933920619-isrmcg104ni73620h5evn8ke39hb5r21.apps.googleusercontent.com";

  useEffect(() => {
    let timer: number;

    const handleCredentialResponse = (response: any) => {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        
        onLogin({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        });
      } catch (error) {
        console.error("Error decoding Google login response:", error);
      }
    };

    const initializeGoogle = () => {
      if (typeof google !== 'undefined') {
        // Always initialize with the current client ID
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, 
        });

        if (!user) {
          const btnParent = document.getElementById("googleBtn");
          if (btnParent) {
            google.accounts.id.renderButton(
              btnParent,
              { 
                theme: isDarkMode ? "filled_black" : "outline", 
                size: "large",
                shape: "pill",
                text: "signin_with",
                width: "240"
              }
            );
          }
          // Only prompt One Tap if no user is logged in
          google.accounts.id.prompt();
        } else {
          // If a user is logged in, ensure any pending One Tap prompts are dismissed
          google.accounts.id.cancel();
        }
      }
    };

    // Small delay to ensure the GSI script is fully ready in the global scope
    timer = window.setTimeout(initializeGoogle, 1000);

    return () => {
      window.clearTimeout(timer);
      if (typeof google !== 'undefined') {
        google.accounts.id.cancel(); // Cleanup on unmount or user change
      }
    };
  }, [user, onLogin, isDarkMode]);

  const currentOrigin = window.location.origin;

  const copyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 dark:bg-slate-100 p-2 rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">SilverStacker<span className="text-slate-400">Pro</span></span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              {!user && (
                <button 
                  onClick={() => setShowTroubleshooter(true)}
                  className="text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-tighter transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Login Help?
                </button>
              )}

              <button 
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent dark:border-slate-700"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              {!user ? (
                <div id="googleBtn" className="min-w-[240px] h-10 flex items-center justify-end overflow-hidden"></div>
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1 pr-3 rounded-full border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-2 duration-300">
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full shadow-sm" />
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">{user.name}</span>
                    <button 
                      onClick={onLogout}
                      className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-tighter text-left transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Troubleshooter Modal */}
      {showTroubleshooter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Fixing Origin Mismatch</h3>
              <button onClick={() => setShowTroubleshooter(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Google requires you to whitelist the exact "Origin" of this preview in your Cloud Console settings.
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl mb-6 relative group">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Current Origin:</p>
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all font-bold">
                  {currentOrigin}
                </code>
                <button 
                  onClick={copyOrigin}
                  className={`shrink-0 p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600'}`}
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Open your <b>Client ID</b> in Google Cloud Console.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Add the URL above to <b>Authorized JavaScript origins</b>.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Also add: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">https://aistudio.google.com</code></p>
              </div>
            </div>

            <button 
              onClick={() => setShowTroubleshooter(false)}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
