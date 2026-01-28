'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, AlertTriangle, Shield, User, CornerDownRight, Zap, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';

interface Alert {
    id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
    title: string;
    description: string;
    createdAt: string;
    indicator?: {
        type: string;
        value: string;
    };
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchAlerts();
    }, [statusFilter]);

    const fetchAlerts = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`/api/alerts?${params}`);
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data.alerts);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateAlertStatus = async (alertId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alertId, status: newStatus }),
            });

            if (response.ok) {
                await fetchAlerts();
            }
        } catch (error) {
            console.error('Failed to update alert:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return <CheckCircle className="w-5 h-5 text-muted-foreground/30" />;
            case 'FALSE_POSITIVE':
                return <XCircle className="w-5 h-5 text-muted-foreground/20" />;
            case 'IN_PROGRESS':
                return <Loader className="p-0 translate-y-0 scale-50" />;
            default:
                return <Clock className="w-5 h-5 text-primary" />;
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'NEW':
                return 'text-primary bg-primary/5 border-primary/10';
            case 'ACKNOWLEDGED':
                return 'text-muted-foreground bg-muted/30 border-border';
            case 'IN_PROGRESS':
                return 'text-slate-900 bg-slate-50 border-slate-900';
            case 'RESOLVED':
                return 'text-muted-foreground/40 bg-muted/10 border-border/50';
            case 'FALSE_POSITIVE':
                return 'text-muted-foreground/20 bg-muted/5 border-border/20';
            default:
                return 'text-muted-foreground bg-muted/5 border-border';
        }
    };

    return (
        <div className="flex flex-col min-h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-border">
                <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-12 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] mb-4">
                            <Zap className="w-3 h-3 fill-current" />
                            Signal Intelligence
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 font-display leading-[0.9]">Signal Manager</h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] font-display ml-1 mt-3 italic opacity-60">Operational Intake & Remediation</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-6 pr-12 py-3 bg-white border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer hover:border-primary transition-all shadow-sm"
                            >
                                <option value="">Status: All Segments</option>
                                <option value="NEW">Queue: Active</option>
                                <option value="ACKNOWLEDGED">Status: Acknowledged</option>
                                <option value="IN_PROGRESS">Status: Remediation</option>
                                <option value="RESOLVED">History: Resolved</option>
                                <option value="FALSE_POSITIVE">History: Noise</option>
                            </select>
                            <MoreHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto w-full p-8 lg:p-12 space-y-10">

                {loading ? (
                    <Loader className="py-24" />
                ) : alerts.length === 0 ? (
                    <div className="py-40 text-center bg-white rounded-[40px] border border-border/50">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-8 border border-border">
                            <CheckCircle className="w-8 h-8 text-muted-foreground/10" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">System Silence</h3>
                        <p className="text-muted-foreground mt-3 max-w-xs mx-auto text-[10px] font-bold uppercase tracking-[0.2em]">No active signals identified in the current telemetry matrix.</p>
                    </div>
                ) : (
                    <div className="space-y-6 pb-20">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="group relative bg-white border border-border rounded-[32px] p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-premium overflow-hidden">
                                {/* Severity Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.severity === 'CRITICAL' ? 'bg-red-600' :
                                    alert.severity === 'HIGH' ? 'bg-orange-600' :
                                        alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-slate-900'
                                    }`} />

                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(alert.status)}
                                                <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{alert.title}</h3>
                                            </div>
                                            <Badge severity={alert.severity} className="font-black px-3">
                                                {alert.severity}
                                            </Badge>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${getStatusTheme(alert.status)}`}>
                                                {alert.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider opacity-60 leading-relaxed max-w-3xl italic">
                                            {alert.description}
                                        </p>

                                        {alert.indicator && (
                                            <div className="flex items-center gap-4 pt-1">
                                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-border rounded-xl group-hover:bg-slate-900 group-hover:border-slate-900 transition-all group/ioc">
                                                    <Shield className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-white transition-colors" />
                                                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest group-hover:text-muted-foreground/60 transition-colors">{alert.indicator.type}</span>
                                                    <span className="text-xs font-black text-slate-900 group-hover:text-white transition-colors">{alert.indicator.value}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col lg:items-end gap-6 shrink-0">
                                        <div className="flex items-center gap-2 text-muted-foreground/30">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                                Ingested {new Date(alert.createdAt).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {alert.status === 'NEW' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="rounded-xl h-11 px-6"
                                                    onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                                                >
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Verify Signal</span>
                                                </Button>
                                            )}
                                            {(alert.status === 'ACKNOWLEDGED') && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl h-11 px-6 border-border bg-slate-50"
                                                    onClick={() => updateAlertStatus(alert.id, 'IN_PROGRESS')}
                                                >
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Initiate Response</span>
                                                </Button>
                                            )}
                                            {(alert.status === 'IN_PROGRESS') && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="rounded-xl h-11 px-6 bg-slate-900"
                                                    onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                                                >
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Close Incident</span>
                                                </Button>
                                            )}
                                            {alert.status !== 'RESOLVED' && alert.status !== 'FALSE_POSITIVE' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl h-11 px-6 text-muted-foreground/50 hover:text-slate-900"
                                                    onClick={() => updateAlertStatus(alert.id, 'FALSE_POSITIVE')}
                                                >
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Dismiss Noise</span>
                                                </Button>
                                            )}
                                            {(alert.status === 'RESOLVED' || alert.status === 'FALSE_POSITIVE') && (
                                                <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 border border-border opacity-60">
                                                    <CheckCircle className="w-4 h-4 text-muted-foreground/30" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Archived</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
