import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Splash = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/onboarding');
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-primary text-white">
            <h1 className="text-4xl font-bold animate-pulse">Sahayak.ai</h1>
        </div>
    );
};
