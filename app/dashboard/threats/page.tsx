'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter } from 'lucide-react';

interface ThreatIndicator {
    id: string;
    type: string;
    value: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    firstSeen: string;
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Threat Intelligence</h1>
                <p className="text-gray-400 mt-1">Indicators of Compromise (IOCs)</p>
            </div>

            {/* Search and Filters */}
            <Card>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search indicators..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-soc-bg border border-soc-border rounded-md text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-soc-accent"
                            />
                        </div>
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 bg-soc-bg border border-soc-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-soc-accent"
                    >
                        <option value="">All Types</option>
                        <option value="IP">IP Address</option>
                        <option value="DOMAIN">Domain</option>
                        <option value="URL">URL</option>
                        <option value="HASH_SHA256">SHA256 Hash</option>
                        <option value="EMAIL">Email</option>
                    </select>
                </div>
            </Card>

            {/* Indicators Table */}
            <Card>
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading indicators...</div>
                ) : indicators.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No indicators found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-soc-border">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Value</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Risk</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Confidence</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Source</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicators.map((indicator) => (
                                    <tr key={indicator.id} className="border-b border-soc-border hover:bg-soc-bg/50">
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-300">{indicator.type.replace('_', ' ')}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-mono text-foreground">{indicator.value}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge severity={getRiskSeverity(indicator.riskScore)}>
                                                {indicator.riskScore}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge severity={indicator.confidence as any}>
                                                {indicator.confidence}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-400">
                                                {indicator.sources[0]?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-400">
                                                {new Date(indicator.lastSeen).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
