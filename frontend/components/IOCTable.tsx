'use client'

import { useState } from 'react'
import { ExternalLink, Shield, AlertTriangle } from 'lucide-react'

interface IOC {
    id: number
    indicator: string
    type: string
    category?: string
    confidence_score: number
    geo_country?: string
    first_seen: string
    last_seen: string
    correlation_count: number
}

interface IOCTableProps {
    iocs: IOC[]
    onRowClick?: (ioc: IOC) => void
}

const typeColors: Record<string, string> = {
    ip: 'bg-blue-500/20 text-blue-400',
    domain: 'bg-purple-500/20 text-purple-400',
    url: 'bg-yellow-500/20 text-yellow-400',
    hash_md5: 'bg-red-500/20 text-red-400',
    hash_sha256: 'bg-red-500/20 text-red-400',
    cve: 'bg-orange-500/20 text-orange-400',
}

const categoryColors: Record<string, string> = {
    malware: 'bg-red-500/20 text-red-400',
    phishing: 'bg-yellow-500/20 text-yellow-400',
    ransomware: 'bg-purple-500/20 text-purple-400',
    botnet: 'bg-blue-500/20 text-blue-400',
    c2: 'bg-pink-500/20 text-pink-400',
    apt: 'bg-indigo-500/20 text-indigo-400',
}

export default function IOCTable({ iocs, onRowClick }: IOCTableProps) {
    const [sortField, setSortField] = useState<keyof IOC>('last_seen')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const handleSort = (field: keyof IOC) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const sortedIOCs = [...iocs].sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]

        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        const comparison = aVal < bVal ? -1 : 1
        return sortDirection === 'asc' ? comparison : -comparison
    })

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-red-400'
        if (score >= 0.5) return 'text-yellow-400'
        return 'text-green-400'
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('indicator')}>
                                Indicator
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('type')}>
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('category')}>
                                Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('confidence_score')}>
                                Confidence
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('geo_country')}>
                                Country
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('correlation_count')}>
                                Sources
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('last_seen')}>
                                Last Seen
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {sortedIOCs.map((ioc) => (
                            <tr
                                key={ioc.id}
                                onClick={() => onRowClick?.(ioc)}
                                className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3 text-sm text-white font-mono max-w-xs truncate">
                                    {ioc.indicator}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[ioc.type] || 'bg-gray-500/20 text-gray-400'}`}>
                                        {ioc.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {ioc.category && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[ioc.category] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {ioc.category}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`font-medium ${getConfidenceColor(ioc.confidence_score)}`}>
                                            {(ioc.confidence_score * 100).toFixed(0)}%
                                        </div>
                                        {ioc.confidence_score >= 0.8 && (
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {ioc.geo_country || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-4 h-4 text-blue-400" />
                                        <span className="text-white">{ioc.correlation_count}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {new Date(ioc.last_seen).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {iocs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    No IOCs found
                </div>
            )}
        </div>
    )
}
