
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
            <div>
                <p>Welcome, {user.displayName || user.email}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Login</h2>
            <button onClick={handleGoogleSignIn}>Sign in with Google</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
