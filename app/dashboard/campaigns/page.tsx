'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Target, Flag, Calendar, Activity, ArrowRight, ShieldAlert, Zap } from 'lucide-react';

export default function CampaignsPage() {
    const [campaigns] = useState([
        { id: '1', name: 'Operation Polar Storm', status: 'ACTIVE', actor: 'Lazarus Group', start: '2024-01-15', intensity: 85, iocCount: 142 },
        { id: '2', name: 'Skyfall Ransom Cluster', status: 'INACTIVE', actor: 'Wizard Spider', start: '2023-11-20', intensity: 40, iocCount: 85 },
        { id: '3', name: 'Shadow Siphon Phase 2', status: 'ACTIVE', actor: 'Fancy Bear', start: '2024-02-01', intensity: 95, iocCount: 210 },
    ]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] shadow-sm backdrop-blur-md">
                        <Flag className="w-3.5 h-3.5" />
                        Operational Intelligence
                    </div>
                    <div>
                        <h1 className="text-7xl font-black tracking-tighter text-slate-900 font-display leading-[0.9]">
                            Active<br />Campaigns
                        </h1>
                        <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.5em] font-display ml-1 mt-6 opacity-40">Tracing Operational Progression</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 px-8 py-6 bg-white border border-border rounded-[32px] shadow-premium group">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] mb-1">Hot Clusters</span>
                        <span className="text-xl font-black text-slate-900 font-display tracking-tighter">08 Critical</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-500/5 flex items-center justify-center relative">
                        <Zap className="w-5 h-5 text-red-500 fill-current animate-pulse opacity-20" />
                    </div>
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="space-y-8">
                {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="border-border hover:border-primary/20 transition-all duration-500 !p-0 overflow-hidden group shadow-premium rounded-[48px] bg-card">
                        <div className="flex flex-col lg:flex-row lg:items-center">
                            {/* Left Visual Hook */}
                            <div className="w-full lg:w-48 bg-secondary/50 p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border min-h-[160px]">
                                <Badge severity={campaign.status === 'ACTIVE' ? 'CRITICAL' : 'LOW'} className="mb-4 h-6 px-3 rounded-lg border-none">
                                    {campaign.status}
                                </Badge>
                                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest text-center leading-none">Status Level</div>
                            </div>

                            {/* Main Detail */}
                            <div className="flex-1 p-10 lg:p-12 space-y-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <h3 className="text-4xl font-black tracking-tighter text-slate-900 font-display group-hover:text-primary transition-colors">{campaign.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5 text-primary" />
                                                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{campaign.actor}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
                                                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Started {campaign.start}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div>
                                            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Ingested Indicators</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-slate-900 font-display tracking-tighter">{campaign.iocCount}</span>
                                                <ShieldAlert className="w-4 h-4 text-primary" />
                                            </div>
                                        </div>
                                        <div className="w-48">
                                            <div className="flex justify-between mb-3 items-center">
                                                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Operational Intensity</span>
                                                <span className="text-[10px] font-black text-slate-900 font-display">{campaign.intensity}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${campaign.intensity > 80 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-primary'}`}
                                                    style={{ width: `${campaign.intensity}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-foreground transition-all duration-500 group-hover:shadow-glow">
                                            <ArrowRight className="w-6 h-6 text-primary group-hover:text-background" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
