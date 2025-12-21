import Link from 'next/link'
import { Shield, Globe, Database, TrendingUp, FileText, Lock } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <Shield className="w-20 h-20 text-blue-400" />
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-4">
                        Threat Intelligence Platform
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Open-source OSINT collection, analysis, and visualization for security teams
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                        >
                            View Dashboard
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
                    <FeatureCard
                        icon={<Database className="w-12 h-12 text-blue-400" />}
                        title="Dynamic Source Management"
                        description="Add and manage threat intelligence sources through an intuitive admin panel. Support for REST APIs, RSS feeds, CSV files, and more."
                    />
                    <FeatureCard
                        icon={<Globe className="w-12 h-12 text-green-400" />}
                        title="Global Threat Map"
                        description="Visualize threats geographically with an interactive world map showing attack origins, hotspots, and threat categories."
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-12 h-12 text-purple-400" />}
                        title="Correlation Engine"
                        description="Automatically correlate IOCs across multiple sources to boost confidence scores and identify trending threats."
                    />
                    <FeatureCard
                        icon={<FileText className="w-12 h-12 text-yellow-400" />}
                        title="News Aggregation"
                        description="Collect and analyze security news from trusted sources with automatic CVE extraction and keyword tagging."
                    />
                    <FeatureCard
                        icon={<Lock className="w-12 h-12 text-red-400" />}
                        title="Role-Based Access"
                        description="Secure admin panel with granular permissions for super admins, analysts, and viewers."
                    />
                    <FeatureCard
                        icon={<Shield className="w-12 h-12 text-indigo-400" />}
                        title="MITRE ATT&CK Mapping"
                        description="Automatic mapping of IOCs to MITRE ATT&CK techniques for better threat context and analysis."
                    />
                </div>

                {/* Stats Section */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard label="Free OSINT Sources" value="4+" />
                    <StatCard label="IOC Types" value="6" />
                    <StatCard label="Auto Enrichment" value="Yes" />
                    <StatCard label="Open Source" value="100%" />
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-700 mt-20 py-8">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>Built for SOC teams, threat intelligence analysts, and security researchers</p>
                    <p className="mt-2 text-sm">Using only free and open-source threat intelligence feeds</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
        </div>
    )
}
