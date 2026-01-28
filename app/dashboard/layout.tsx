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
    ChevronLeft,
    ChevronRight,
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/login' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-display selection:bg-primary/30 relative">
            {/* Cosmic Background Elements */}
            <div className="fixed inset-0 cosmic-grid pointer-events-none" />
            <div className="fixed inset-0 cosmic-stars pointer-events-none" />
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-border transform transition-all duration-500 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col group/sidebar`}
            >
                <div className="flex flex-col h-full relative">
                    {/* Collapse Toggle Button (Desktop Only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border/50 items-center justify-center text-muted-foreground hover:text-primary transition-all z-50 shadow-premium"
                    >
                        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                    </button>

                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className={`p-8 pb-10 ${isCollapsed ? 'px-6' : 'px-8'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="absolute -inset-2 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        {!isCollapsed ? (
                                            <h1 className="text-2xl font-black tracking-tighter text-foreground font-display relative text-gradient transition-all duration-500">Intelify</h1>
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Shield className="w-5 h-5 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!isCollapsed && (
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="mt-2 flex items-center gap-2 animate-in fade-in duration-500">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    <p className="text-[8px] text-muted-foreground/40 uppercase tracking-[0.4em] font-black">Secure Nexus V4.2</p>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className={`flex-1 ${isCollapsed ? 'px-4' : 'px-6'} space-y-1.5 overflow-y-auto custom-scrollbar transition-all duration-500`}>
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center ${isCollapsed ? 'justify-center p-0 h-12' : 'gap-3 px-4 py-2.5'} rounded-xl transition-all duration-300 group ${isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <item.icon className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                        {!isCollapsed && (
                                            <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-primary' : ''} animate-in fade-in slide-in-from-left-2 duration-300`}>{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile */}
                        <div className={`p-6 border-t border-border bg-slate-50 transition-all duration-500 ${isCollapsed ? 'px-4' : 'p-6'}`}>
                            <div className={`flex items-center ${isCollapsed ? 'justify-center mb-0' : 'gap-4 mb-5'}`}>
                                <div className={`${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-all`}>
                                    <User className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-primary`} />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                                        <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tight font-display">
                                            {session?.user?.name || session?.user?.email?.split('@')[0]}
                                        </p>
                                        <p className="text-[8px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em]">
                                            {session?.user?.role || 'Operator'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-10 rounded-xl bg-background/50 hover:bg-background border border-border/50 text-muted-foreground hover:text-red-400 transition-all duration-300 animate-in fade-in duration-300"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="w-3.5 h-3.5 mr-2" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Terminate</span>
                                </Button>
                            )}
                            {isCollapsed && (
                                <button
                                    onClick={handleSignOut}
                                    className="hidden group-hover/sidebar:flex absolute bottom-24 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all z-50 shadow-premium"
                                    title="Sign Out"
                                >
                                    <LogOut size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="flex items-center gap-3 text-foreground">
                            <span className="font-black text-xl tracking-tight uppercase font-display text-gradient">Intelify</span>
                        </div>
                        <div className="w-10" />
                    </div>
                </header>

                {/* Page Content Area - Rigid Grid Layout */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#fcfcfd]">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
