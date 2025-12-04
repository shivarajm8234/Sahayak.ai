import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const Splash = () => {
    const user = useAppStore(state => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (user) {
                navigate('/home');
            } else {
                navigate('/auth');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div className="flex items-center justify-center h-screen bg-primary text-white">
            <h1 className="text-4xl font-bold animate-pulse">Sahayak.ai</h1>
        </div>
    );
};
