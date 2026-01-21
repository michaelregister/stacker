
import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, isDarkMode, onToggleDarkMode }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loginData, setLoginData] = useState({ name: '', email: '' });

  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.name || !loginData.email) return;
    
    onLogin({
      name: loginData.name,
      email: loginData.email.toLowerCase(),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(loginData.name)}&background=0D8ABC&color=fff`
    });
    setShowLoginModal(false);
    setLoginData({ name: '', email: '' });
    setShowInfoModal(true); // Show instructions after simulated login
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
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.12 5.36-7.84 5.36-4.8 0-8.68-3.92-8.68-8.72s3.88-8.72 8.68-8.72c2.72 0 4.56 1.16 5.6 2.16l2.56-2.48c-1.64-1.56-4.2-2.52-8.16-2.52-6.64 0-12 5.36-12 12s5.36 12 12 12c6.92 0 11.52-4.88 11.52-11.72 0-.8-.08-1.4-.2-2.04h-11.32z"/>
                  </svg>
                  Sign in
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1 pr-3 rounded-full border border-slate-100 dark:border-slate-700">
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full shadow-sm" />
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">{user.name}</span>
                    <button 
                      onClick={onLogout}
                      className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-tighter text-left"
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

      {/* Login Instruction Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-blue-500/30 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-500/10 p-3 rounded-2xl">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Setup Production Auth</h3>
                  <p className="text-sm text-slate-500">To enable real Google Login, follow these steps:</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">1</span>
                  <p>Visit the <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-500 font-bold hover:underline">Google Cloud Console</a>.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">2</span>
                  <p>Create a project and navigate to <b>APIs & Services &gt; Credentials</b> to create an <b>OAuth 2.0 Client ID</b>.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">3</span>
                  <p>Add your application domain to <b>Authorized JavaScript Origins</b>.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">4</span>
                  <p>Replace the placeholder <code>client_id</code> in <code>Header.tsx</code> with your new ID.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl mt-8 hover:opacity-90 transition-opacity"
              >
                Got it, let's stack!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Sign In</h3>
                  <p className="text-sm text-slate-500">Access your private silver stack</p>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSimulatedLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Name</label>
                  <input 
                    type="text" 
                    required
                    value={loginData.name}
                    onChange={e => setLoginData({...loginData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={loginData.email}
                    onChange={e => setLoginData({...loginData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl mt-4 hover:opacity-90 transition-opacity"
                >
                  Continue to Stack
                </button>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-tighter mt-4">
                  Demo Mode: Data is saved locally using your email as a key.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
