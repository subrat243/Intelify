'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { apiClient } from '@/lib/api'
import 'leaflet/dist/leaflet.css'

interface ThreatData {
    country_code: string
    country_name: string
    latitude: number
    longitude: number
    threat_count: number
    categories: Record<string, number>
}

interface ThreatMapProps {
    timeRange: number
    category: string
    onStatsUpdate: (stats: any) => void
}

const categoryColors: Record<string, string> = {
    malware: '#ef4444',
    phishing: '#f59e0b',
    ransomware: '#a855f7',
    botnet: '#3b82f6',
    c2: '#ec4899',
    apt: '#6366f1',
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

export default function ThreatMap({ timeRange, category, onStatsUpdate }: ThreatMapProps) {
    const [threatData, setThreatData] = useState<ThreatData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadThreatData()
    }, [timeRange, category])

    const loadThreatData = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getThreatMapData({
                days: timeRange,
                category: category || undefined,
            })

            setThreatData(data)

            // Update stats
            const totalThreats = data.reduce((sum: number, item: ThreatData) => sum + item.threat_count, 0)
            const countries = data.length
            const allCategories: Record<string, number> = {}

            data.forEach((item: ThreatData) => {
                Object.entries(item.categories).forEach(([cat, count]) => {
                    allCategories[cat] = (allCategories[cat] || 0) + count
                })
            })

            const topCategory = Object.entries(allCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

            onStatsUpdate({
                totalThreats,
                countries,
                topCategory,
            })
        } catch (error) {
            console.error('Failed to load threat map data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getMarkerColor = (categories: Record<string, number>) => {
        // Return color of the most prevalent category
        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0]
        return categoryColors[topCategory] || '#64748b'
    }

    const getMarkerSize = (count: number) => {
        // Scale marker size based on threat count
        if (count > 1000) return 20
        if (count > 500) return 15
        if (count > 100) return 12
        if (count > 50) return 10
        return 8
    }

    if (loading) {
        return (
            <div className="h-[600px] flex items-center justify-center">
                <div className="text-white">Loading threat data...</div>
            </div>
        )
    }

    return (
        <div className="h-[600px] relative">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />
                <MapUpdater center={[20, 0]} />

                {threatData.map((threat, index) => (
                    <CircleMarker
                        key={index}
                        center={[threat.latitude, threat.longitude]}
                        radius={getMarkerSize(threat.threat_count)}
                        fillColor={getMarkerColor(threat.categories)}
                        color="#fff"
                        weight={2}
                        opacity={0.8}
                        fillOpacity={0.6}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <div className="font-bold text-lg mb-2">
                                    {threat.country_name || threat.country_code}
                                </div>
                                <div className="text-sm mb-2">
                                    <strong>Total Threats:</strong> {threat.threat_count.toLocaleString()}
                                </div>
                                <div className="text-sm">
                                    <strong>Categories:</strong>
                                    <div className="mt-1 space-y-1">
                                        {Object.entries(threat.categories)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([cat, count]) => (
                                                <div key={cat} className="flex justify-between items-center">
                                                    <span className="capitalize">{cat}:</span>
                                                    <span className="font-semibold ml-2">{count}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {threatData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-10">
                    <div className="text-white text-center">
                        <p className="text-lg mb-2">No threat data available</p>
                        <p className="text-sm text-gray-400">Try adjusting the filters</p>
                    </div>
                </div>
            )}
        </div>
    )
}
