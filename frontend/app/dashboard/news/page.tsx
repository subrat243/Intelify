'use client'

import { useEffect, useState } from 'react'
import { FileText, ExternalLink, Calendar, Tag } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function NewsPage() {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('')

    useEffect(() => {
        loadNews()
    }, [category])

    const loadNews = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getNews({
                category: category || undefined,
                limit: 50,
            })
            setArticles(data)
        } catch (error) {
            console.error('Failed to load news:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-purple-400" />
                    Security News Feed
                </h1>
                <p className="text-gray-400">Latest cybersecurity news and threat intelligence</p>
            </div>

            {/* Filter */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-300">Category:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option value="General">General</option>
                        <option value="Advisory">Advisory</option>
                        <option value="Malware">Malware</option>
                        <option value="Ransomware">Ransomware</option>
                        <option value="APT">APT</option>
                    </select>
                    <div className="ml-auto text-sm text-gray-400">
                        {articles.length} articles
                    </div>
                </div>
            </div>

            {/* News Articles */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <div className="text-white">Loading news...</div>
                    </div>
                ) : articles.length > 0 ? (
                    articles.map((article) => (
                        <NewsCard key={article.id} article={article} />
                    ))
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <div className="text-gray-400">No news articles found</div>
                    </div>
                )}
            </div>
        </div>
    )
}

function NewsCard({ article }: { article: any }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-semibold text-white flex-1">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                        {article.title}
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </h3>
                {article.category && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium whitespace-nowrap">
                        {article.category}
                    </span>
                )}
            </div>

            {article.summary && (
                <p className="text-gray-300 mb-4 line-clamp-3">{article.summary}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {article.published_at && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.published_at).toLocaleDateString()}
                    </div>
                )}

                {article.keywords && article.keywords.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <div className="flex flex-wrap gap-1">
                            {article.keywords.slice(0, 5).map((keyword: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-slate-700 text-gray-300 rounded text-xs"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {article.cve_references && article.cve_references.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-red-400">CVEs:</span>
                        <div className="flex flex-wrap gap-1">
                            {article.cve_references.map((cve: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono"
                                >
                                    {cve}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
