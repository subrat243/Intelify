'use client'

import { useEffect, useState } from 'react'
import { Shield, ExternalLink, Calendar, AlertTriangle, TrendingUp } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface CVEData {
    cve_id: string
    severity: string
    description: string
    published_date: string
    cvss_score?: number
    affected_products?: string[]
    references?: string[]
}

export default function CVEFeedPage() {
    const [cves, setCVEs] = useState<CVEData[]>([])
    const [loading, setLoading] = useState(true)
    const [severityFilter, setSeverityFilter] = useState('')

    useEffect(() => {
        loadCVEs()
    }, [severityFilter])

    const loadCVEs = async () => {
        try {
            setLoading(true)
            // For now, we'll extract CVEs from news articles
            const news = await apiClient.getNews({ limit: 100 })

            // Extract unique CVEs from news articles
            const cveMap = new Map<string, CVEData>()

            news.forEach((article: any) => {
                if (article.cve_references && article.cve_references.length > 0) {
                    article.cve_references.forEach((cveId: string) => {
                        if (!cveMap.has(cveId)) {
                            cveMap.set(cveId, {
                                cve_id: cveId,
                                severity: determineSeverity(cveId, article.title),
                                description: article.title,
                                published_date: article.published_at,
                                references: [article.url],
                            })
                        } else {
                            // Add reference to existing CVE
                            const existing = cveMap.get(cveId)!
                            if (!existing.references?.includes(article.url)) {
                                existing.references = [...(existing.references || []), article.url]
                            }
                        }
                    })
                }
            })

            let cveList = Array.from(cveMap.values())

            // Apply severity filter
            if (severityFilter) {
                cveList = cveList.filter(cve => cve.severity === severityFilter)
            }

            // Sort by date (newest first)
            cveList.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())

            setCVEs(cveList)
        } catch (error) {
            console.error('Failed to load CVEs:', error)
        } finally {
            setLoading(false)
        }
    }

    const determineSeverity = (cveId: string, title: string): string => {
        const titleLower = title.toLowerCase()
        if (titleLower.includes('critical') || titleLower.includes('rce') || titleLower.includes('remote code')) {
            return 'CRITICAL'
        } else if (titleLower.includes('high') || titleLower.includes('exploit')) {
            return 'HIGH'
        } else if (titleLower.includes('medium') || titleLower.includes('moderate')) {
            return 'MEDIUM'
        } else if (titleLower.includes('low')) {
            return 'LOW'
        }
        return 'MEDIUM'
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-red-400" />
            case 'HIGH': return <TrendingUp className="w-5 h-5 text-orange-400" />
            default: return <Shield className="w-5 h-5 text-blue-400" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-red-400" />
                    CVE Vulnerability Feed
                </h1>
                <p className="text-gray-400">Common Vulnerabilities and Exposures from security news</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{cves.length}</div>
                    <div className="text-sm text-gray-400">Total CVEs</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-400">
                        {cves.filter(c => c.severity === 'CRITICAL').length}
                    </div>
                    <div className="text-sm text-gray-400">Critical</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">
                        {cves.filter(c => c.severity === 'HIGH').length}
                    </div>
                    <div className="text-sm text-gray-400">High</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">
                        {cves.filter(c => c.severity === 'MEDIUM').length}
                    </div>
                    <div className="text-sm text-gray-400">Medium</div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Severity:</label>
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                    <div className="ml-auto text-sm text-gray-400">
                        {cves.length} vulnerabilities
                    </div>
                </div>
            </div>

            {/* CVE List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <div className="text-white">Loading CVEs...</div>
                    </div>
                ) : cves.length > 0 ? (
                    cves.map((cve) => (
                        <CVECard key={cve.cve_id} cve={cve} getSeverityColor={getSeverityColor} getSeverityIcon={getSeverityIcon} />
                    ))
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <div className="text-gray-400">No CVEs found</div>
                    </div>
                )}
            </div>
        </div>
    )
}

function CVECard({ cve, getSeverityColor, getSeverityIcon }: any) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    {getSeverityIcon(cve.severity)}
                    <h3 className="text-xl font-bold text-white font-mono">
                        {cve.cve_id}
                    </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(cve.severity)}`}>
                    {cve.severity}
                </span>
            </div>

            <p className="text-gray-300 mb-4">{cve.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                {cve.published_date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(cve.published_date).toLocaleDateString()}
                    </div>
                )}
                {cve.references && (
                    <div className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        {cve.references.length} reference{cve.references.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {cve.references && cve.references.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                    <div className="text-sm font-medium text-gray-300 mb-2">References:</div>
                    <div className="space-y-1">
                        {cve.references.slice(0, 3).map((ref: string, index: number) => (
                            <a
                                key={index}
                                href={ref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                <span className="truncate">{new URL(ref).hostname}</span>
                            </a>
                        ))}
                        {cve.references.length > 3 && (
                            <div className="text-xs text-gray-500">
                                +{cve.references.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
