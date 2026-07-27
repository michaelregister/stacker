
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState(auth.currentUser);

    auth.onAuthStateChanged(currentUser => {
        setUser(currentUser);
    });

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    }

    if (user) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                <p className="text-slate-900 dark:text-white font-medium">Welcome, {user.displayName || user.email}</p>
                <button
                    onClick={handleLogout}
                    className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="bg-slate-900 dark:bg-slate-100 p-3 rounded-xl shadow-sm mb-4">
                <svg className="w-8 h-8 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Welcome to Stacker<span className="text-slate-400">Pro</span></h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to track and value your precious metals stack.</p>
            <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.82z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.11C3.25 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 010-4.58V6.6H1.28a12 12 0 000 10.8l4.01-3.11z"/>
                    <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.6l4.01 3.11C6.23 6.86 8.88 4.75 12 4.75z"/>
                </svg>
                Sign in with Google
            </button>
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default Login;
