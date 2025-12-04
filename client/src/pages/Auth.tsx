import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const Auth = () => {
    const navigate = useNavigate();
    const user = useAppStore(state => state.user);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            if (user.preferredLanguage) {
                navigate('/home');
            } else {
                navigate('/onboarding');
            }
        }
    }, [user, navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setError('');
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col justify-center p-6 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-tertiaryContainer rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primaryContainer rounded-full blur-3xl opacity-40"></div>

            <div className="max-w-md w-full mx-auto bg-surface rounded-3xl shadow-xl border border-outline/10 relative z-10 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-onSurface mb-2 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Join Sahayak'}
                        </h2>
                        <p className="text-onSurfaceVariant">
                            {isLogin ? 'Sign in to continue' : 'Create your account'}
                        </p>
                    </div>

                    {/* Material Tabs */}
                    <div className="flex bg-surfaceVariant/50 rounded-full p-1 mb-8">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-300 ${isLogin ? 'bg-primary text-onPrimary shadow-md' : 'text-onSurfaceVariant hover:bg-surfaceVariant'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-3 rounded-full text-sm font-medium transition-all duration-300 ${!isLogin ? 'bg-primary text-onPrimary shadow-md' : 'text-onSurfaceVariant hover:bg-surfaceVariant'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="bg-errorContainer text-onErrorContainer p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {resetSent && (
                        <div className="bg-green-100 text-green-800 p-4 rounded-xl text-sm mb-6 border border-green-200">
                            Password reset email sent!
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-4 text-outline group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 p-4 bg-surfaceVariant/30 border border-outline/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-onSurface placeholder:text-outline/50"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-4 text-outline group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 p-4 bg-surfaceVariant/30 border border-outline/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-onSurface placeholder:text-outline/50"
                                placeholder="Password"
                                required
                                minLength={6}
                            />
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-onPrimary rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
