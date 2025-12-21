'use client'

import { useState } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'

interface AddSourceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddSourceModal({ isOpen, onClose, onSuccess }: AddSourceModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'rest',
        url: '',
        description: '',
        trust_weight: 0.8,
        fetch_interval_minutes: 60,
        api_key: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { apiClient } = await import('@/lib/api')

            const config: any = {}
            if (formData.api_key) {
                config.api_key = formData.api_key
            }

            await apiClient.createSource({
                name: formData.name,
                type: formData.type,
                url: formData.url,
                description: formData.description,
                trust_weight: formData.trust_weight,
                fetch_interval_minutes: formData.fetch_interval_minutes,
                config: Object.keys(config).length > 0 ? config : undefined,
            })

            // Reset form
            setFormData({
                name: '',
                type: 'rest',
                url: '',
                description: '',
                trust_weight: 0.8,
                fetch_interval_minutes: 60,
                api_key: '',
            })

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create source')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-6 h-6 text-blue-400" />
                        Add New Source
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Source Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Source Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            placeholder="e.g., Custom Threat Feed"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Source Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Source Type <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="rest">REST API</option>
                            <option value="rss">RSS Feed</option>
                            <option value="csv">CSV File</option>
                            <option value="github">GitHub Repository</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.type === 'rest' && 'REST API endpoint that returns JSON data'}
                            {formData.type === 'rss' && 'RSS/Atom feed URL for threat intelligence'}
                            {formData.type === 'csv' && 'URL to a CSV file with threat indicators'}
                            {formData.type === 'github' && 'GitHub repository with threat data'}
                        </p>
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {formData.type === 'rss' ? 'RSS Feed URL' : 'API Endpoint URL'} <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => handleChange('url', e.target.value)}
                            required
                            placeholder={
                                formData.type === 'rss'
                                    ? 'https://example.com/threats.xml'
                                    : 'https://api.example.com/v1/threats'
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* API Key (optional) */}
                    {(formData.type === 'rest' || formData.type === 'github') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API Key (Optional)
                            </label>
                            <input
                                type="password"
                                value={formData.api_key}
                                onChange={(e) => handleChange('api_key', e.target.value)}
                                placeholder="Enter API key if required"
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                API key will be encrypted and stored securely
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            placeholder="Brief description of this threat intelligence source..."
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Advanced Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Trust Weight
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={formData.trust_weight}
                                    onChange={(e) => handleChange('trust_weight', parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">
                                    {(formData.trust_weight * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                How much to trust this source (affects confidence scores)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Fetch Interval (minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="1440"
                                value={formData.fetch_interval_minutes}
                                onChange={(e) => handleChange('fetch_interval_minutes', parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                How often to fetch data from this source
                            </p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">📝 Note</h4>
                        <ul className="text-xs text-gray-300 space-y-1">
                            <li>• Source will be enabled by default after creation</li>
                            <li>• First fetch will happen within the specified interval</li>
                            <li>• You can create custom adapters for specific source formats</li>
                            <li>• See README for adapter development guide</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Creating...' : 'Create Source'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
