'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Users, Target, Globe, Shield, Calendar, ExternalLink, ArrowRight, Activity } from 'lucide-react';

export default function ActorsPage() {
    const [actors, setActors] = useState([
        { id: '1', name: 'Lazarus Group', aliases: ['APT38', 'Guardians of Peace'], origin: 'North Korea', status: 'Active', ttpCount: 42, riskLevel: 'CRITICAL' },
        { id: '2', name: 'Fancy Bear', aliases: ['APT28', 'Sofacy'], origin: 'Russia', status: 'Highly Active', ttpCount: 65, riskLevel: 'CRITICAL' },
        { id: '3', name: 'Wizard Spider', aliases: ['UNC1878'], origin: 'Russia', status: 'Active', ttpCount: 28, riskLevel: 'HIGH' },
    ]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] shadow-sm backdrop-blur-md">
                        <Users className="w-3.5 h-3.5" />
                        Strategic Intelligence
                    </div>
                    <div>
                        <h1 className="text-7xl font-black tracking-tighter text-foreground font-display leading-[0.9] text-glow">
                            Threat<br />Actors
                        </h1>
                        <p className="text-muted-foreground/40 font-black text-xs uppercase tracking-[0.5em] font-display ml-1 mt-6">Profiling Adversarial Clusters</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-6 px-8 py-6 bg-card border border-border rounded-[32px] shadow-premium">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] mb-1">Monitored Entities</span>
                            <span className="text-xl font-black text-foreground font-display tracking-tighter">124</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {actors.map((actor) => (
                    <Card key={actor.id} className="border-border hover:border-primary/40 transition-all duration-500 flex flex-col gap-10 !p-10 group shadow-premium rounded-[40px] relative overflow-hidden bg-card">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                <Users className="w-8 h-8" />
                            </div>
                            <Badge severity={actor.riskLevel as any} className="h-8 px-4 rounded-xl border-none">
                                {actor.riskLevel}
                            </Badge>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter text-foreground font-display mb-2">{actor.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {actor.aliases.map(alias => (
                                        <span key={alias} className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest border border-border px-2 py-1 rounded-lg bg-muted/50">{alias}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1">Origin</p>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-black text-foreground uppercase tracking-tight">{actor.origin}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1">TTP Count</p>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-black text-foreground uppercase tracking-tight">{actor.ttpCount} Techniques</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-10 border-t border-border/50 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                                Last seen 2d ago
                            </span>
                            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center group-hover:bg-foreground group-hover:border-foreground transition-all duration-500">
                                <ArrowRight className="w-5 h-5 text-primary group-hover:text-background transition-colors" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
