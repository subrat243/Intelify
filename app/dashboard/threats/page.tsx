'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Filter, Calendar, MoreVertical, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';

interface ThreatIndicator {
    id: string;
    type: string;
    value: string;
    confidence: string;
    riskScore: number;
    lastSeen: string;
    sources: { name: string }[];
}

export default function ThreatsPage() {
    const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchIndicators();
    }, [searchQuery, typeFilter]);

    const fetchIndicators = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (typeFilter) params.append('type', typeFilter);

            const response = await fetch(`/api/search?${params}`);
            const data = await response.json();
            if (data.success) {
                setIndicators(data.data.indicators);
            }
        } catch (error) {
            console.error('Failed to fetch indicators:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskSeverity = (score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' => {
        if (score >= 80) return 'CRITICAL';
        if (score >= 60) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        return 'LOW';
    };

    return (
        <div className="flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-border">
                <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-12 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em]">
                            <Shield className="w-3 h-3 fill-current" />
                            Threat Core Nexus
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 font-display leading-[0.9]">Indicator Vault</h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] font-display ml-1 mt-3 italic">Centralized Intelligence Core / Sector VII</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="h-10 px-5 rounded-xl border border-border/50 bg-background/50 hover:bg-background text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 mr-2" />
                            <span className="font-black text-[9px] uppercase tracking-widest">History</span>
                        </Button>
                        <Button size="sm" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                            <Search className="w-3.5 h-3.5 mr-2" />
                            <span className="font-black text-[9px] uppercase tracking-widest">New Vector</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full p-8 lg:p-12 space-y-10">

                {/* Search and Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-9">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors w-4 h-4 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Query signature database..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-card/40 border border-border/50 rounded-xl text-foreground text-[11px] font-bold placeholder:text-muted-foreground/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 shadow-sm holographic"
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary w-3.5 h-3.5 pointer-events-none transition-colors" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-card/40 border border-border/50 rounded-xl text-foreground text-[9px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer shadow-sm holographic"
                            >
                                <option value="">Global Filter</option>
                                <option value="IP">Network IP</option>
                                <option value="DOMAIN">DNS Domain</option>
                                <option value="URL">Resource URL</option>
                                <option value="HASH_SHA256">SHA256 Sig</option>
                                <option value="EMAIL">Email Origin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Indicators Table */}
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <Loader className="py-24" />
                    ) : indicators.length === 0 ? (
                        <div className="text-center py-24 space-y-5">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto border border-border/30">
                                <Shield className="w-6 h-6 text-muted-foreground/20" />
                            </div>
                            <p className="text-muted-foreground/30 font-black uppercase tracking-widest text-[10px]">Perimeter Secured</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-slate-50/50">
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Type Segment</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Signature Payload</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Exposure</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Confidence</th>
                                        <th className="py-4 px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Detection Pulse</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {indicators.map((indicator) => (
                                        <tr key={indicator.id} className="group hover:bg-primary/[0.02] transition-all cursor-pointer">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100/50 border border-border flex items-center justify-center group-hover:border-primary/20 transition-colors">
                                                        <Shield size={12} className="text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{indicator.type.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <code className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-border tracking-tight group-hover:bg-primary/5 transition-colors">{indicator.value}</code>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge severity={indicator.confidence as any} className="h-5 text-[9px] px-2 font-black">
                                                    Lvl {indicator.riskScore}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">{indicator.confidence}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{new Date(indicator.lastSeen).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(indicator.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Pagination */}
                <div className="flex items-center justify-between px-1 pb-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-glow" />
                        <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                            Found <span className="text-foreground">{indicators.length}</span> Critical Segments
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-secondary/50 text-muted-foreground">
                            <MoreVertical size={14} />
                        </Button>
                        <div className="h-3 w-[1px] bg-border/20 mx-2" />
                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-lg bg-background/50 border border-border/50 font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-background">Prev</Button>
                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-lg bg-background/50 border border-border/50 font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-background">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
