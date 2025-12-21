'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Globe, Filter, Calendar } from 'lucide-react'

// Dynamically import the map to avoid SSR issues
const ThreatMapComponent = dynamic(() => import('@/components/ThreatMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] bg-slate-800/50 rounded-xl flex items-center justify-center">
            <div className="text-white">Loading map...</div>
        </div>
    ),
})

export default function ThreatMapPage() {
    const [timeRange, setTimeRange] = useState(7)
    const [category, setCategory] = useState<string>('')
    const [stats, setStats] = useState({
        totalThreats: 0,
        countries: 0,
        topCategory: '',
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Globe className="w-8 h-8 text-blue-400" />
                    Global Threat Map
                </h1>
                <p className="text-gray-400">Geographic visualization of cyber threats worldwide</p>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Time Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Time Range
                        </label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={1}>Last 24 Hours</option>
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Threat Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="malware">Malware</option>
                            <option value="phishing">Phishing</option>
                            <option value="ransomware">Ransomware</option>
                            <option value="botnet">Botnet</option>
                            <option value="c2">C2</option>
                            <option value="apt">APT</option>
                        </select>
                    </div>

                    {/* Stats Summary */}
                    <div className="flex items-end">
                        <div className="bg-slate-700/50 rounded-lg p-4 w-full">
                            <div className="text-2xl font-bold text-white">{stats.totalThreats.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Threats</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                <ThreatMapComponent
                    timeRange={timeRange}
                    category={category}
                    onStatsUpdate={setStats}
                />
            </div>

            {/* Legend */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Map Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <LegendItem color="bg-red-500" label="Malware" />
                    <LegendItem color="bg-yellow-500" label="Phishing" />
                    <LegendItem color="bg-purple-500" label="Ransomware" />
                    <LegendItem color="bg-blue-500" label="Botnet" />
                    <LegendItem color="bg-pink-500" label="C2" />
                    <LegendItem color="bg-indigo-500" label="APT" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm text-gray-400">
                        <strong className="text-white">Marker Size:</strong> Represents the number of threats from that location
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        <strong className="text-white">Click markers</strong> to view detailed threat information
                    </p>
                </div>
            </div>
        </div>
    )
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${color}`}></div>
            <span className="text-sm text-gray-300">{label}</span>
        </div>
    )
}
