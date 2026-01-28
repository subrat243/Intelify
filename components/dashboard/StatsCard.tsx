'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
}

export function StatsCard({
    title,
    value,
    description,
    trend,
    trendValue,
    icon,
}: StatsCardProps) {
    const isUp = trend === 'up';
    const isDown = trend === 'down';

    return (
        <div className="group relative">
            {/* Subtle highlight effect */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 -z-10 ${isUp ? 'bg-emerald-500/10' : isDown ? 'bg-red-500/10' : 'bg-primary/10'
                }`} />

            <Card className="h-full border-border bg-white overflow-hidden !p-5 rounded-2xl shadow-premium hover:shadow-none transition-all duration-500 group-hover:border-primary/40 cosmic-gradient-border">
                <div className="flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 font-display transition-colors group-hover:text-primary">
                                {title}
                            </span>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-3xl font-black text-foreground tracking-tighter font-display leading-none">
                                    {value}
                                </h2>
                                {trend && trendValue && (
                                    <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        isDown ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-muted/50 text-muted-foreground border-border/50'
                                        }`}>
                                        {isUp ? <ArrowUpRight size={10} strokeWidth={3} /> :
                                            isDown ? <ArrowDownRight size={10} strokeWidth={3} /> :
                                                <Minus size={10} strokeWidth={3} />}
                                        {trendValue}
                                    </div>
                                )}
                            </div>
                        </div>
                        {icon && (
                            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-105 group-hover:border-primary/30 group-hover:bg-primary/5">
                                <div className="scale-90">{icon}</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="h-[1px] w-full bg-border/20" />
                        <div className="flex items-center justify-between">
                            <p className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-[0.2em] leading-none">
                                {description || "Telemetrics Status"}
                            </p>
                            <div className="flex gap-1.5 items-end h-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className={`w-1 rounded-full transition-all duration-500 ${isUp ? 'bg-emerald-500/20 group-hover:bg-emerald-500/40' :
                                            isDown ? 'bg-red-500/20 group-hover:bg-red-500/40' :
                                                'bg-primary/20 group-hover:bg-primary/40'
                                            }`}
                                        style={{ height: `${20 + (i * 20)}%`, opacity: 0.2 + (i * 0.2) }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
