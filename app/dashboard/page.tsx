'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    Shield,
    AlertTriangle,
    TrendingUp,
    Bug,
    ChevronRight,
    Search,
    Zap,
    Activity,
    Target,
    ArrowRight,
    ExternalLink,
    RefreshCw,
    Clock,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { DashboardStats } from '@/lib/types';
import { Loader } from '@/components/ui/Loader';

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#4f46e5', '#2563eb', '#7c3aed'];

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                <Loader className="p-0 scale-125" />
                <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.4em] animate-pulse">Initializing Command Center</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Card className="max-w-md text-center py-16 border-red-100 bg-red-50/10">
                    <div className="w-20 h-20 bg-red-100 rounded-[40%] flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-red-900 font-display">Neural Link Failure</h3>
                    <p className="text-red-700/60 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Telemetry synchronization failed at junction point-9.</p>
                </Card>
            </div>
        );
    }

    const indicatorTypeData = Object.entries(stats.indicatorsByType).map(([type, count]) => ({
        name: type.replace('_', ' '),
        value: count,
    }));

    const confidenceData = Object.entries(stats.indicatorsByConfidence).map(([level, count]) => ({
        name: level,
        value: count,
    }));

    return (
        <div className="flex flex-col min-h-full">
            {/* Platform Operational Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-border">
                <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-12 py-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em]">
                            <Zap className="w-3 h-3 fill-current" />
                            Intelligence Unit v4.2
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 font-display leading-[0.9]">
                                Operations Central
                            </h1>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] font-display ml-1 mt-3">GTOC-PRIME Sector Activity</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 px-5 py-3 bg-white border border-border rounded-xl group hover:border-primary/20 transition-all duration-300 shadow-sm">
                            <div className="flex flex-col items-end">
                                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Last Pulse Sync</span>
                                <span className="text-base font-black text-slate-900 font-display tabular-nums tracking-tighter">00:43:08</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                                <Activity className="w-3.5 h-3.5 text-primary" />
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-11 px-6 rounded-xl bg-white border border-border text-muted-foreground hover:text-slate-900 hover:bg-slate-50 transition-all font-black uppercase tracking-[0.15em] text-[10px] group shadow-sm"
                        >
                            Export Log
                            <ExternalLink className="w-3 h-3 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full p-8 lg:p-12 space-y-12">
                {/* Tactical Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <StatsCard
                        title="Total Indicators"
                        value={stats.totalIndicators.toLocaleString()}
                        description="IOC Registry Count"
                        icon={<Shield size={20} />}
                        trend="up"
                        trendValue="+12.5%"
                    />
                    <StatsCard
                        title="Active Alerts"
                        value={stats.activeAlerts.toLocaleString()}
                        description="Immediate Action Required"
                        icon={<AlertTriangle size={20} />}
                        trend="neutral"
                        trendValue="Stable"
                    />
                    <StatsCard
                        title="Threat Matrix"
                        value={stats.highRiskIndicators.toLocaleString()}
                        description="Criticality Exposure"
                        icon={<Target size={20} />}
                        trend="up"
                        trendValue="+4.2%"
                    />
                    <StatsCard
                        title="CVE Registry"
                        value={stats.criticalCVEs.toLocaleString()}
                        description="CVSS ≥ 9.0 Verified"
                        icon={<Bug size={20} />}
                        trend="down"
                        trendValue="-2.1%"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-stretch">
                    {/* Activity Graph */}
                    <div className="lg:col-span-8">
                        <div className="bg-card/40 border border-border/50 rounded-3xl p-8 shadow-premium h-full group hover:border-primary/20 transition-all duration-700">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 mb-1 font-display">Propagation Heatmap</h3>
                                    <p className="text-xl font-black text-foreground tracking-tighter font-display leading-none text-gradient">Threat Signal Intensity</p>
                                </div>
                                <div className="flex gap-2 h-8 items-end">
                                    {[3, 5, 2, 8, 4, 6, 3].map((i, idx) => (
                                        <div key={idx} className="w-1.5 bg-primary/10 rounded-full group-hover:bg-primary transition-all duration-700" style={{ height: `${i * 10}%` }} />
                                    ))}
                                </div>
                            </div>
                            <div className="h-[350px] w-full cursor-crosshair">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.recentActivity}>
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={9}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                            dy={15}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={9}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                        />
                                        <Tooltip
                                            cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 1 }}
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                padding: '12px',
                                            }}
                                            itemStyle={{ color: '#1e293b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                            labelStyle={{ color: '#6366f1', marginBottom: '4px', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#chartGradient)"
                                            animationDuration={2500}
                                            activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: '#fff', strokeWidth: 3 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Distribution Side Col */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="h-full border-border/50 !p-8 flex flex-col rounded-3xl shadow-premium">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 mb-8 font-display">Cluster Matrix</h3>
                            <div className="h-[220px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={indicatorTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                            animationDuration={2000}
                                            animationBegin={200}
                                        >
                                            {indicatorTypeData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    stroke="hsl(var(--card))"
                                                    strokeWidth={6}
                                                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '16px',
                                                fontSize: '11px',
                                                fontWeight: 900,
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] leading-tight">Total</p>
                                    <p className="text-4xl font-black text-foreground leading-tight font-display tracking-tighter">{stats.totalIndicators}</p>
                                </div>
                            </div>
                            <div className="mt-auto space-y-5 pt-12">
                                {indicatorTypeData.slice(0, 4).map((item, i) => (
                                    <div key={item.name} className="flex items-center justify-between group/legend cursor-default">
                                        <div className="flex items-center gap-5">
                                            <div className="w-2 h-8 rounded-full transition-all duration-500 group-hover/legend:h-10" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover/legend:text-foreground transition-colors">{item.name}</span>
                                        </div>
                                        <span className="text-lg font-black text-foreground font-display tracking-tighter">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Recent Alerts Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tighter text-foreground font-display">Active Intake</h2>
                            <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">Sector Synchronization</p>
                        </div>
                        <Link href="/dashboard/alerts" className="h-10 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-[8px] font-black uppercase tracking-[0.15em] text-foreground flex items-center gap-2 transition-colors border border-border/50">
                            View Log <ChevronRight className="w-3 h-3 text-primary" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.recentAlerts.slice(0, 3).map((alert) => (
                            <Card key={alert.id} className="border-border/50 hover:border-primary/30 transition-all duration-500 flex flex-col gap-6 !p-6 group shadow-premium rounded-3xl relative overflow-hidden bg-card/40">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover:scale-110 ${alert.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        alert.severity === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                            alert.severity === 'MEDIUM' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                'bg-muted border-border text-muted-foreground'
                                        }`}>
                                        <Zap className={`w-6 h-6 ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'fill-current' : ''}`} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${alert.status === 'NEW' ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-secondary text-muted-foreground border-border'}`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <h3 className="font-black text-2xl tracking-tighter text-foreground line-clamp-1 group-hover:text-primary transition-colors font-display">{alert.title}</h3>
                                    <div className="flex items-center gap-3 text-muted-foreground/60">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{new Date(alert.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-10 border-t border-border/50 flex items-center justify-between relative z-10">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-muted-foreground/30'}`}>
                                        Severity {alert.severity}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center group-hover:bg-foreground group-hover:border-foreground transition-all duration-500 group-hover:shadow-lg">
                                        <ArrowRight className="w-5 h-5 text-primary group-hover:text-background transition-colors" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
