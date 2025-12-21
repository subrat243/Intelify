'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Download, AlertCircle } from 'lucide-react'
import IOCTable from '@/components/IOCTable'
import { apiClient } from '@/lib/api'

export default function IOCsPage() {
    const [iocs, setIOCs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        country: '',
        minConfidence: 0,
    })
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        loadIOCs()
        loadStats()
    }, [])

    const loadIOCs = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getIOCs({
                indicator: searchTerm || undefined,
                ioc_type: filters.type || undefined,
                category: filters.category || undefined,
                country: filters.country || undefined,
                min_confidence: filters.minConfidence || undefined,
                limit: 100,
            })
            setIOCs(data)
        } catch (error) {
            console.error('Failed to load IOCs:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const data = await apiClient.getIOCStats()
            setStats(data)
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        loadIOCs()
    }

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        loadIOCs()
    }

    const resetFilters = () => {
        setFilters({
            type: '',
            category: '',
            country: '',
            minConfidence: 0,
        })
        setSearchTerm('')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">IOC Search & Analysis</h1>
                <p className="text-gray-400">Search and filter threat indicators from all sources</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{stats.total_iocs?.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Total IOCs</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.iocs_last_24h?.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Last 24 Hours</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">
                            {stats.top_categories?.[0]?.category || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">Top Category</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">
                            {stats.top_countries?.[0]?.country || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">Top Country</div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by indicator (IP, domain, URL, hash)..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </form>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="ip">IP Address</option>
                            <option value="domain">Domain</option>
                            <option value="url">URL</option>
                            <option value="hash_md5">MD5 Hash</option>
                            <option value="hash_sha256">SHA256 Hash</option>
                            <option value="cve">CVE</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                        <input
                            type="text"
                            value={filters.country}
                            onChange={(e) => handleFilterChange('country', e.target.value.toUpperCase())}
                            placeholder="e.g., US, CN, RU"
                            maxLength={2}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Min Confidence: {(filters.minConfidence * 100).toFixed(0)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={filters.minConfidence}
                            onChange={(e) => handleFilterChange('minConfidence', parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={applyFilters}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Apply Filters
                    </button>
                    <button
                        onClick={resetFilters}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Results */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                        {loading ? 'Loading...' : `${iocs.length} IOCs Found`}
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {loading ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <div className="text-white">Loading IOCs...</div>
                    </div>
                ) : (
                    <IOCTable iocs={iocs} />
                )}
            </div>
        </div>
    )
}
