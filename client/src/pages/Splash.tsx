import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const Splash = () => {
    const user = useAppStore(state => state.user);
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            console.log("Splash: User state:", user);
            if (user?.preferredLanguage) {
                console.log("Splash: Navigating to Home");
                navigate('/home');
            } else {
                console.log("Splash: Navigating to Onboarding");
                navigate('/onboarding');
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-surface text-onSurface relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primaryContainer rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-secondaryContainer rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

            <div className={`z-10 flex flex-col items-center transition-all duration-1000 transform ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-tertiary rounded-3xl flex items-center justify-center shadow-2xl mb-8 animate-bounce-slow rotate-3">
                    <span className="text-6xl font-bold text-onPrimary">S</span>
                </div>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3 tracking-tight">Sahayak.ai</h1>
                <p className="text-xl text-onSurfaceVariant font-medium tracking-wide">Empowering Rural India</p>
            </div>

            <div className="absolute bottom-12 z-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-onSurfaceVariant/70">Loading your assistant...</p>
            </div>
        </div>
    );
};
