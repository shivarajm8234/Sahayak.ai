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
            if (user) {
                if (user.preferredLanguage) {
                    navigate('/home');
                } else {
                    navigate('/onboarding');
                }
            } else {
                navigate('/auth');
            }
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-surface text-onSurface relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primaryContainer rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-secondaryContainer rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

            <div className={`z-10 flex flex-col items-center transition-all duration-1000 transform ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-lg mb-6 animate-bounce-slow">
                    <span className="text-4xl font-bold text-onPrimary">S</span>
                </div>
                <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">Sahayak.ai</h1>
                <p className="text-lg text-secondary font-medium">Your Voice. Your Loan.</p>
            </div>

            <div className="absolute bottom-12 z-10">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};
