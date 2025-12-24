'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'FALSE_POSITIVE':
                return <XCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW':
                return 'bg-red-500/10 text-red-500 border-red-500/30';
            case 'ACKNOWLEDGED':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
            case 'IN_PROGRESS':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
            case 'RESOLVED':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
            case 'FALSE_POSITIVE':
                return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
                <p className="text-gray-400 mt-1">Security alerts and notifications</p>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-soc-bg border border-soc-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-soc-accent"
                    >
                        <option value="">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="ACKNOWLEDGED">Acknowledged</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="FALSE_POSITIVE">False Positive</option>
                    </select>
                </div>
            </Card>

            {/* Alerts List */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading alerts...</div>
            ) : alerts.length === 0 ? (
                <Card>
                    <div className="text-center py-12 text-gray-400">No alerts found</div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className="hover:border-soc-accent/50 transition-colors">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getStatusIcon(alert.status)}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {alert.title}
                                                </h3>
                                                <Badge severity={alert.severity}>{alert.severity}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">{alert.description}</p>

                                            {alert.indicator && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-soc-bg rounded-md">
                                                    <span className="text-xs text-gray-500">{alert.indicator.type}:</span>
                                                    <span className="text-xs font-mono text-foreground">
                                                        {alert.indicator.value}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.status)}`}>
                                            {alert.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {alert.status !== 'RESOLVED' && alert.status !== 'FALSE_POSITIVE' && (
                                    <div className="flex gap-2 pt-2 border-t border-soc-border">
                                        {alert.status === 'NEW' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                                            >
                                                Acknowledge
                                            </Button>
                                        )}
                                        {(alert.status === 'ACKNOWLEDGED' || alert.status === 'IN_PROGRESS') && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                                                >
                                                    Resolve
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => updateAlertStatus(alert.id, 'FALSE_POSITIVE')}
                                                >
                                                    Mark False Positive
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
