'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    Shield,
    Newspaper,
    Target,
    AlertTriangle,
    LogOut,
    User,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Threat Intelligence', href: '/dashboard/threats', icon: Shield },
    { name: 'News Intelligence', href: '/dashboard/news', icon: Newspaper },
    { name: 'MITRE ATT&CK', href: '/dashboard/mitre', icon: Target },
    { name: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/login' });
    };

    return (
        <div className="min-h-screen bg-soc-bg">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-soc-card border-r border-soc-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-soc-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-soc-accent/10 rounded-lg">
                                <Shield className="w-6 h-6 text-soc-accent" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">Intelify</h1>
                                <p className="text-xs text-gray-400">TIP Platform</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-foreground"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-soc-accent text-white'
                                            : 'text-gray-400 hover:bg-soc-bg hover:text-foreground'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-soc-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-soc-accent/10 rounded-full">
                                <User className="w-5 h-5 text-soc-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {session?.user?.name || session?.user?.email}
                                </p>
                                <p className="text-xs text-gray-400 uppercase">
                                    {session?.user?.role}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-soc-card border-b border-soc-border px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-400 hover:text-foreground"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-soc-accent" />
                            <span className="font-bold text-foreground">Intelify</span>
                        </div>
                        <div className="w-6" /> {/* Spacer for centering */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
