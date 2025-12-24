'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/ui/Card';
import {
    Shield,
    AlertTriangle,
    TrendingUp,
    Bug,
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400">Failed to load dashboard data</div>
            </div>
        );
    }

    // Prepare chart data
    const indicatorTypeData = Object.entries(stats.indicatorsByType).map(([type, count]) => ({
        name: type.replace('_', ' '),
        value: count,
    }));

    const confidenceData = Object.entries(stats.indicatorsByConfidence).map(([level, count]) => ({
        name: level,
        value: count,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-gray-400 mt-1">Real-time threat intelligence metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Indicators"
                    value={stats.totalIndicators.toLocaleString()}
                    description="Active IOCs"
                    icon={<Shield className="w-6 h-6" />}
                />
                <StatsCard
                    title="High-Risk Threats"
                    value={stats.highRiskIndicators.toLocaleString()}
                    description="Risk score ≥ 70"
                    icon={<TrendingUp className="w-6 h-6" />}
                />
                <StatsCard
                    title="Active Alerts"
                    value={stats.activeAlerts.toLocaleString()}
                    description="Requires attention"
                    icon={<AlertTriangle className="w-6 h-6" />}
                />
                <StatsCard
                    title="Critical CVEs"
                    value={stats.criticalCVEs.toLocaleString()}
                    description="CVSS ≥ 9.0"
                    icon={<Bug className="w-6 h-6" />}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Chart */}
                <Card title="Recent Activity" description="Last 7 days">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.recentActivity}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af' }}
                            />
                            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Indicator Types Chart */}
                <Card title="Indicator Types" description="Distribution by type">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={indicatorTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {indicatorTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
                {/* Confidence Levels Chart */}
                <Card title="Confidence Levels" description="Indicator confidence distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={confidenceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill="#3b82f6" name="Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
