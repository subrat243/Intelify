'use client'

import { useEffect, useState } from 'react'
import { Plus, FileText, Power, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function AdminNewsSourcesPage() {
    const [sources, setSources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSources()
    }, [])

    const loadSources = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getNewsSources()
            setSources(data)
        } catch (error) {
            console.error('Failed to load news sources:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (id: number) => {
        try {
            await apiClient.toggleNewsSource(id)
            loadSources()
        } catch (error) {
            console.error('Failed to toggle source:', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this news source?')) return

        try {
            await apiClient.deleteNewsSource(id)
            loadSources()
        } catch (error) {
            console.error('Failed to delete source:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-purple-400" />
                        News Source Management
                    </h1>
                    <p className="text-gray-400">Manage security news feed sources</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    <Plus className="w-5 h-5" />
                    Add News Source
                </button>
            </div>

            {/* Sources List */}
            {loading ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="text-white">Loading news sources...</div>
                </div>
            ) : (
                <div className="space-y-4">
                    {sources.map((source) => (
                        <div
                            key={source.id}
                            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-white">{source.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${source.is_enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            <span className="text-sm text-gray-400">{source.is_enabled ? 'Active' : 'Disabled'}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">{source.description || 'No description'}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">URL:</span>
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:text-blue-300 font-mono text-xs">
                                                {source.url}
                                            </a>
                                        </div>
                                        {source.category && (
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                {source.category}
                                            </span>
                                        )}
                                        <span className="text-gray-500 text-xs">
                                            Interval: {source.fetch_interval_minutes} min
                                        </span>
                                    </div>
                                    {source.last_fetch_at && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Last fetched: {new Date(source.last_fetch_at).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleToggle(source.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${source.is_enabled
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(source.id)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {sources.length === 0 && !loading && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="text-gray-400">No news sources configured</div>
                </div>
            )}
        </div>
    )
}
