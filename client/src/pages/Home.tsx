import { useAppStore } from '../store/useAppStore';
import { Mic, User, Bell, ChevronRight, Sparkles, ClipboardList, Search, FileText, BarChart3, Sprout } from 'lucide-react';

export const Home = () => {
    const { user, setVoiceActive } = useAppStore();

    return (
        <div className="min-h-screen bg-surface pb-24 relative overflow-hidden">
            {/* Header */}
            <div className="bg-surface sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-outline/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primaryContainer rounded-full flex items-center justify-center text-onPrimaryContainer font-bold text-lg">
                        {user?.displayName ? user.displayName[0].toUpperCase() : <User size={20} />}
                    </div>
                    <div>
                        <p className="text-xs text-onSurfaceVariant font-medium">Welcome Back</p>
                        <h1 className="text-lg font-bold text-onSurface leading-tight">
                            {user?.displayName || 'Sahayak User'}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-onSurfaceVariant hover:bg-surfaceVariant rounded-full">
                        <Bell size={24} />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Hero Card */}
                <div className="bg-primaryContainer rounded-3xl p-6 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-onPrimaryContainer">
                            <Sparkles size={18} />
                            <span className="font-medium text-sm">AI Assistant</span>
                        </div>
                        <h2 className="text-2xl font-bold text-onPrimaryContainer mb-4">
                            Need a loan? <br /> Just ask Vaani.
                        </h2>
                        <button
                            onClick={() => setVoiceActive(true)}
                            className="bg-primary text-onPrimary px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
                        >
                            <Mic size={20} />
                            Tap to Speak
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-bold text-onSurface mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Check Eligibility', icon: <ClipboardList size={24} />, color: 'bg-secondaryContainer text-onSecondaryContainer' },
                            { label: 'Browse Schemes', icon: <Search size={24} />, color: 'bg-tertiaryContainer text-onTertiaryContainer' },
                            { label: 'Upload Docs', icon: <FileText size={24} />, color: 'bg-surfaceVariant text-onSurfaceVariant' },
                            { label: 'Track Status', icon: <BarChart3 size={24} />, color: 'bg-surfaceVariant text-onSurfaceVariant' },
                        ].map((action, i) => (
                            <button key={i} className={`${action.color} p-4 rounded-2xl flex flex-col items-start gap-3 hover:opacity-90 transition-opacity text-left`}>
                                <span className="mb-1">{action.icon}</span>
                                <span className="font-bold text-sm">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-onSurface">Recent Activity</h3>
                        <button className="text-primary text-sm font-bold">View All</button>
                    </div>
                    <div className="bg-surfaceVariant/30 rounded-2xl p-1">
                        {[1, 2].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-surfaceVariant/50 rounded-xl transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-primary shadow-sm">
                                        <Sprout size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-onSurface text-sm">Kisan Credit Card</h4>
                                        <p className="text-xs text-onSurfaceVariant">Viewed 2 hours ago</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-outline" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Mic Button (FAB) */}
            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={() => setVoiceActive(true)}
                    className="w-16 h-16 bg-primary text-onPrimary rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all animate-bounce-slow"
                >
                    <Mic size={32} />
                </button>
            </div>
        </div>
    );
};
