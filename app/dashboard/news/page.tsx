'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExternalLink, RefreshCw, Newspaper, Calendar, Hash, ArrowRight, Zap } from 'lucide-react';
import { Loader } from '@/components/ui/Loader'; // Added Loader import

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
    source: { name: string };
    cves: { cveId: string; severity: string }[];
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await fetch('/api/news');
            const data = await response.json();
            if (data.success) {
                setNews(data.data.news);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setFetching(true);
        try {
            const response = await fetch('/api/news', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                await fetchNews();
            }
        } catch (error) {
            console.error('Failed to refresh news:', error);
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="sticky top-0 z-20 bg-white border-b border-border">
                <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-12 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3 fill-current" />
                            OSINT Stream Nexus
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 font-display leading-[0.9]">Indicator Vault</h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] font-display ml-1 mt-3">Global OSINT Node Aggregator / Phase IV</p>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={fetching}
                        className="md:w-auto w-full group overflow-hidden relative h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2.5 ${fetching ? 'animate-spin' : ''}`} />
                        <span className="font-black uppercase tracking-[0.15em] text-[9px]">
                            {fetching ? 'Syncing...' : 'Force Uplink'}
                        </span>
                    </Button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full p-8 lg:p-12 space-y-12">
                {loading ? (
                    <Loader className="py-24" />
                ) : news.length === 0 ? (
                    <div className="py-24 text-center bg-card/40 rounded-3xl border border-border/50 holographic">
                        <Newspaper className="w-12 h-12 text-muted-foreground/20 mx-auto mb-5" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-foreground/80">Intelligence Void</h3>
                        <p className="text-muted-foreground/40 mt-2 mb-8 max-w-sm mx-auto text-[8px] font-bold uppercase tracking-[0.2em]">No incoming telemetry segments detected. Verify uplink connectivity.</p>
                        <Button onClick={handleRefresh} variant="ghost" className="rounded-xl px-6 h-10 border border-border/50 bg-background/50 hover:bg-background">
                            <span className="font-black text-[9px] uppercase tracking-widest">Init Pulse Sync</span>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {news.map((item) => (
                            <div key={item.id} className="group relative bg-card/40 border border-border/50 rounded-2xl p-6 flex flex-col h-full hover:border-primary/40 transition-all duration-500 hover:shadow-glow cursor-pointer relative overflow-hidden cosmic-gradient-border">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div className="w-1 h-3 bg-primary rounded-full shrink-0" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 truncate group-hover:text-primary transition-colors">
                                                {item.source.name}
                                            </span>
                                        </div>
                                        <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter">Segment V4</div>
                                    </div>

                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {item.title}
                                    </h2>

                                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-bold uppercase tracking-wide group-hover:text-foreground/90 transition-delay-300 transition-colors line-clamp-2">
                                        {item.summary}
                                    </p>

                                    {item.cves.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {item.cves.map((cve) => (
                                                <Badge key={cve.cveId} severity={cve.severity as any} className="px-2 py-0.5 font-bold text-[7px] group-hover:border-primary/40 transition-all">
                                                    {cve.cveId}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">
                                            {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-primary group-hover:border-primary transition-all"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center pt-10 border-t border-neutral-50 pb-20">
                    <Button variant="ghost" className="px-12 h-14 rounded-2xl hover:bg-neutral-50 group">
                        <span className="font-black uppercase tracking-[0.4em] text-[10px] text-neutral-400 group-hover:text-black">Archive Manifest</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
