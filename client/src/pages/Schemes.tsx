import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GeminiService } from '../services/gemini';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, Sparkles, ExternalLink, Loader2, Sprout, BookOpen, Home as HomeIcon, User, Car, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Schemes = () => {
    const navigate = useNavigate();
    const { user, language } = useAppStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [summary, setSummary] = useState('');
    const geminiService = new GeminiService();

    // Categories to display
    const categories = [
        { id: 'agriculture', label: 'Agriculture', icon: <Sprout size={32} />, color: 'bg-green-100 text-green-800' },
        { id: 'education', label: 'Education', icon: <BookOpen size={32} />, color: 'bg-blue-100 text-blue-800' },
        { id: 'home', label: 'Home Loan', icon: <HomeIcon size={32} />, color: 'bg-orange-100 text-orange-800' },
        { id: 'personal', label: 'Personal', icon: <User size={32} />, color: 'bg-purple-100 text-purple-800' },
        { id: 'vehicle', label: 'Vehicle', icon: <Car size={32} />, color: 'bg-red-100 text-red-800' },
    ];

    useEffect(() => {
        // Only fetch initial schemes from Firestore on mount
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const schemesSnap = await getDocs(collection(db, 'schemes'));
                const schemes = schemesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Initial match with empty query if needed, or just show all
                // For now, let's just show categories
            } catch (error) {
                console.error("Error fetching initial schemes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery && !selectedCategory) return;

        setLoading(true);
        try {
            let schemes = [];

            if (searchQuery) {
                // 1. Try real-time scraping first
                try {
                    const response = await fetch(`/api/scrape?q=${encodeURIComponent(searchQuery)}`);
                    if (response.ok) {
                        const data = await response.json();
                        // Map API data to scheme format
                        schemes = data.map((item: any) => ({
                            id: item.Source, // Use source URL as temp ID
                            title: `${item.Bank} - ${item['Sub-Category']}`,
                            provider: item.Bank,
                            type: item['Loan Category'].toLowerCase(),
                            subCategory: item['Sub-Category'].toLowerCase(),
                            interestRate: item['Interest Rate'],
                            url: item.Source,
                            details: item.Details,
                            lastScrapedAt: Date.now()
                        }));
                    }
                } catch (err) {
                    console.error("API scrape failed, falling back to Firestore", err);
                }
            }

            // 2. If no API results or no search query, fetch from Firestore
            if (schemes.length === 0) {
                const schemesSnap = await getDocs(collection(db, 'schemes'));
                schemes = schemesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Filter locally
                schemes = schemes.filter((s: any) => {
                    const matchesCategory = selectedCategory ? (
                        s.type?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                        s.title?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                        s.subCategory?.toLowerCase().includes(selectedCategory.toLowerCase())
                    ) : true;

                    const matchesSearch = searchQuery ? (
                        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.subCategory?.toLowerCase().includes(searchQuery.toLowerCase())
                    ) : true;

                    return matchesCategory && matchesSearch;
                });
            }

            if (schemes.length === 0) {
                setSummary(`No schemes found matching your criteria.`);
                setMatches([]);
                setLoading(false);
                return;
            }

            // 3. Match with Gemini
            const result = await geminiService.matchSchemes(user, schemes, language);
            setMatches(result.matches || []);
            setSummary(result.summary || "Here are the best schemes for you.");
        } catch (error) {
            console.error("Error in schemes page:", error);
            setSummary("Something went wrong while finding schemes.");
        } finally {
            setLoading(false);
        }
    };

    // Trigger search when category changes
    useEffect(() => {
        if (selectedCategory) {
            handleSearch();
        }
    }, [selectedCategory, user, language]); // Added user, language as dependencies for handleSearch

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSearchQuery(''); // Clear search when selecting category
    };

    return (
        <div className="min-h-screen bg-surface pb-6">
            {/* Header */}
            <div className="bg-surface sticky top-0 z-10 px-6 py-4 flex flex-col gap-4 border-b border-outline/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => selectedCategory ? setSelectedCategory(null) : navigate(-1)} className="p-2 -ml-2 text-onSurfaceVariant hover:bg-surfaceVariant rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-onSurface">
                        {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.label} Schemes` : 'Select Loan Type'}
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-onSurfaceVariant" size={20} />
                        <input
                            type="text"
                            placeholder="Search schemes (e.g. 'SBI crop loan')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-surfaceVariant/50 border-none focus:ring-2 focus:ring-primary/50 text-onSurface placeholder:text-onSurfaceVariant/70"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-onPrimary rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Scrape'}
                    </button>
                </div>
            </div>

            <div className="p-6">
                {!selectedCategory && !searchQuery && matches.length === 0 ? (
                    // Category Selection Grid
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className={`${cat.color} p-6 rounded-3xl flex flex-col items-center justify-center gap-4 aspect-square shadow-sm hover:scale-105 transition-transform`}
                            >
                                <div className="p-3 bg-white/50 rounded-full backdrop-blur-sm">
                                    {cat.icon}
                                </div>
                                <span className="font-bold text-lg">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                ) : loading ? (
                    // Loading State
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <Loader2 size={48} className="text-primary animate-spin" />
                        <p className="text-onSurfaceVariant animate-pulse">
                            Finding best loans for you...
                        </p>
                    </div>
                ) : (
                    // Results
                    <div className="space-y-6">
                        {/* AI Summary */}
                        <div className="bg-primaryContainer/30 p-4 rounded-2xl flex gap-3 items-start">
                            <Sparkles className="text-primary shrink-0 mt-1" size={20} />
                            <p className="text-onSurface text-sm leading-relaxed">{summary}</p>
                        </div>

                        {/* Matches */}
                        {matches.length > 0 ? (
                            <div className="space-y-4">
                                {matches.map((scheme, i) => (
                                    <div key={i} className="bg-surfaceVariant/30 p-5 rounded-2xl border border-outline/10 hover:border-primary/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-onSurface text-lg leading-tight">{scheme.title}</h3>
                                            {scheme.match_score > 0.8 && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                                    Best Match
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-onSurfaceVariant text-sm mb-4">{scheme.reason}</p>
                                        <button className="w-full py-3 rounded-xl bg-surface text-primary font-bold text-sm flex items-center justify-center gap-2 border border-outline/10 hover:bg-surfaceVariant transition-colors">
                                            View Details <ExternalLink size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-onSurfaceVariant">
                                <p>No specific schemes found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
