'use client'

import { useEffect, useState } from 'react'
import { Database, Shield, FileText, TrendingUp, Globe, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatsCard from '@/components/StatsCard'
import IOCTable from '@/components/IOCTable'
import { apiClient } from '@/lib/api'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
    const [overview, setOverview] = useState<any>(null)
    const [recentIOCs, setRecentIOCs] = useState<any[]>([])
    const [trending, setTrending] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [overviewData, iocsData, trendingData] = await Promise.all([
                apiClient.getDashboardOverview(),
                apiClient.getIOCs({ limit: 10 }),
                apiClient.getTrendingThreats({ limit: 5 })
            ])

            setOverview(overviewData)
            setRecentIOCs(iocsData)
            setTrending(trendingData)
        } catch (error) {
            console.error('Failed to load dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Loading dashboard...</div>
            </div>
        )
    }

    const categoryData = overview?.top_categories?.map((cat: any) => ({
        name: cat.category,
        value: cat.count
    })) || []

    const countryData = overview?.top_countries?.slice(0, 10).map((country: any) => ({
        name: country.country,
        count: country.count
    })) || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence Overview</h1>
                <p className="text-gray-400">Real-time threat intelligence from OSINT sources</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total IOCs"
                    value={overview?.total_iocs || 0}
                    icon={Database}
                    color="blue"
                />
                <StatsCard
                    title="Active Sources"
                    value={`${overview?.active_sources || 0}/${overview?.total_sources || 0}`}
                    icon={Shield}
                    color="green"
                />
                <StatsCard
                    title="News Articles"
                    value={overview?.total_news || 0}
                    icon={FileText}
                    color="purple"
                />
                <StatsCard
                    title="Last 24h"
                    value={overview?.iocs_last_24h || 0}
                    icon={TrendingUp}
                    color="yellow"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Categories */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Threat Categories</h2>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No data available
                        </div>
                    )}
                </div>

                {/* Top Countries */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Top Threat Origins</h2>
                    {countryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={countryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No data available
                        </div>
                    )}
                </div>
            </div>

            {/* Trending Threats */}
            {trending.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        Trending Threats
                    </h2>
                    <div className="space-y-3">
                        {trending.map((threat, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <div className="flex-1">
                                    <div className="font-mono text-white mb-1">{threat.indicator}</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                            {threat.type}
                                        </span>
                                        {threat.category && (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                                                {threat.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="text-right">
                                        <div className="text-yellow-400 font-semibold">{threat.count} reports</div>
                                        <div className="text-gray-500 text-xs">
                                            {new Date(threat.last_seen).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent IOCs */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent IOCs</h2>
                    <a href="/dashboard/iocs" className="text-blue-400 hover:text-blue-300 text-sm">
                        View all →
                    </a>
                </div>
                <IOCTable iocs={recentIOCs} />
            </div>
        </div>
    )
}
