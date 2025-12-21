import { useEffect, useState } from 'react'
import { Plus, Settings, Power, Trash2, Edit, Activity } from 'lucide-react'
import { apiClient } from '@/lib/api'
import AddSourceModal from '@/components/AddSourceModal'

export default function AdminSourcesPage() {
    const [sources, setSources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        loadSources()
    }, [])

    const loadSources = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getSources()
            setSources(data)
        } catch (error) {
            console.error('Failed to load sources:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (id: number) => {
        try {
            await apiClient.toggleSource(id)
            loadSources()
        } catch (error) {
            console.error('Failed to toggle source:', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this source?')) return

        try {
            await apiClient.deleteSource(id)
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
                        <Settings className="w-8 h-8 text-blue-400" />
                        Source Management
                    </h1>
                    <p className="text-gray-400">Manage threat intelligence sources</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Source
                </button>
            </div>

            {/* Sources Grid */}
            {loading ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="text-white">Loading sources...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sources.map((source) => (
                        <SourceCard
                            key={source.id}
                            source={source}
                            onToggle={() => handleToggle(source.id)}
                            onDelete={() => handleDelete(source.id)}
                        />
                    ))}
                </div>
            )}

            {sources.length === 0 && !loading && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="text-gray-400 mb-4">No sources configured</div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Add Your First Source
                    </button>
                </div>
            )}

            {/* Add Source Modal */}
            <AddSourceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={loadSources}
            />
        </div>
    )
}

function SourceCard({ source, onToggle, onDelete }: any) {
    const [health, setHealth] = useState<any>(null)

    useEffect(() => {
        loadHealth()
    }, [source.id])

    const loadHealth = async () => {
        try {
            const data = await apiClient.getSourceHealth(source.id)
            setHealth(data)
        } catch (error) {
            console.error('Failed to load health:', error)
        }
    }

    const getStatusColor = () => {
        if (!source.is_enabled) return 'bg-gray-500'
        if (health?.is_healthy) return 'bg-green-500'
        return 'bg-red-500'
    }

    const getStatusText = () => {
        if (!source.is_enabled) return 'Disabled'
        if (health?.is_healthy) return 'Healthy'
        return 'Unhealthy'
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{source.name}</h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                            <span className="text-sm text-gray-400">{getStatusText()}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{source.description || 'No description'}</p>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                            {source.type}
                        </span>
                        <span className="text-xs text-gray-500">
                            Trust: {(source.trust_weight * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-700/30 rounded-lg">
                <div>
                    <div className="text-sm text-gray-400">Fetch Interval</div>
                    <div className="text-white font-semibold">{source.fetch_interval_minutes} min</div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">Failures</div>
                    <div className={`font-semibold ${source.consecutive_failures > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {source.consecutive_failures}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">Last Success</div>
                    <div className="text-white text-sm">
                        {source.last_success_at ? new Date(source.last_success_at).toLocaleDateString() : 'Never'}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-gray-400">Next Fetch</div>
                    <div className="text-white text-sm">
                        {source.next_fetch_at ? new Date(source.next_fetch_at).toLocaleTimeString() : 'N/A'}
                    </div>
                </div>
            </div>

            {/* Error */}
            {source.last_error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-xs text-red-400 font-mono">{source.last_error}</div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onToggle}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${source.is_enabled
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                >
                    <Power className="w-4 h-4" />
                    {source.is_enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
