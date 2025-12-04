import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    type ConfirmationResult
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const Auth = () => {
    const navigate = useNavigate();
    const user = useAppStore(state => state.user);
    const [method, setMethod] = useState<'email' | 'phone'>('email');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/home');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setupRecaptcha();
        const appVerifier = (window as any).recaptchaVerifier;
        try {
            // Format phone number: +91XXXXXXXXXX
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!confirmationResult) return;
        try {
            await confirmationResult.confirm(otp);
            navigate('/home');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6">
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
                    <p className="text-gray-500 mb-8">Sign in to continue to Sahayak.ai</p>

                    {/* Method Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                        <button
                            onClick={() => setMethod('email')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${method === 'email' ? 'bg-white shadow text-primary' : 'text-gray-500'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Mail size={18} /> Email
                            </div>
                        </button>
                        <button
                            onClick={() => setMethod('phone')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${method === 'phone' ? 'bg-white shadow text-primary' : 'text-gray-500'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Phone size={18} /> Phone
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {method === 'email' ? (
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-primary text-sm font-medium hover:underline"
                                >
                                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {!confirmationResult ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                                +91
                                            </span>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="flex-1 p-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div id="recaptcha-container"></div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-center text-2xl tracking-widest"
                                            placeholder="123456"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmationResult(null)}
                                        className="w-full text-gray-500 text-sm hover:text-gray-700"
                                    >
                                        Change Phone Number
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
