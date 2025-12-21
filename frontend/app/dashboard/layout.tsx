'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, LayoutDashboard, Globe, Database, FileText, Settings, LogOut, Menu, X, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        apiClient.loadToken()

        apiClient.getCurrentUser()
            .then(setUser)
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false))
    }, [router])

    const handleLogout = () => {
        apiClient.clearToken()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Top Navigation */}
            <nav className="bg-slate-800 border-b border-slate-700">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden text-gray-400 hover:text-white mr-4"
                            >
                                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <Shield className="w-8 h-8 text-blue-400" />
                            <span className="ml-2 text-xl font-bold text-white">TIP</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-300 text-sm">
                                {user?.username} <span className="text-gray-500">({user?.role})</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-800 border-r border-slate-700
          transition-transform duration-300 ease-in-out
          mt-16 lg:mt-0
        `}>
                    <nav className="p-4 space-y-2">
                        <NavLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
                            Overview
                        </NavLink>
                        <NavLink href="/dashboard/threat-map" icon={<Globe className="w-5 h-5" />}>
                            Threat Map
                        </NavLink>
                        <NavLink href="/dashboard/iocs" icon={<Database className="w-5 h-5" />}>
                            IOCs
                        </NavLink>
                        <NavLink href="/dashboard/news" icon={<FileText className="w-5 h-5" />}>
                            News Feed
                        </NavLink>
                        <NavLink href="/dashboard/cves" icon={<AlertTriangle className="w-5 h-5" />}>
                            CVE Feed
                        </NavLink>

                        {(user?.role === 'super_admin' || user?.role === 'analyst') && (
                            <>
                                <div className="pt-4 pb-2">
                                    <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Admin
                                    </div>
                                </div>
                                <NavLink href="/admin/sources" icon={<Settings className="w-5 h-5" />}>
                                    Sources
                                </NavLink>
                                <NavLink href="/admin/news-sources" icon={<FileText className="w-5 h-5" />}>
                                    News Sources
                                </NavLink>
                            </>
                        )}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
            {icon}
            <span>{children}</span>
        </Link>
    )
}
