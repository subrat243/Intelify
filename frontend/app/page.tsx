'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Globe, Database, TrendingUp, FileText, Lock, Menu, X, ChevronRight, Sparkles, Zap, Eye, AlertTriangle, Sun, Moon } from 'lucide-react'

export default function Home() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = !darkMode
        setDarkMode(newTheme)
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    }

    return (
        <div className={`min-h-screen relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Subtle background pattern */}
            <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 opacity-50' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white opacity-50'}`}></div>


            {/* Glassmorphism Navigation Bar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? darkMode
                    ? 'bg-slate-900/60 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl shadow-black/20'
                    : 'bg-white/60 backdrop-blur-2xl border-b border-gray-300/50 shadow-xl shadow-gray-300/30'
                : darkMode
                    ? 'bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/30'
                    : 'bg-white/40 backdrop-blur-xl border-b border-gray-300/30'
                }`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Enhanced Logo with glass effect */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className={`relative p-2.5 rounded-xl transition-all backdrop-blur-sm ${darkMode ? 'bg-slate-800/60 group-hover:bg-slate-700/60 border border-slate-600/30' : 'bg-white/60 group-hover:bg-white/80 border border-gray-300/30 shadow-sm'}`}>
                                <Shield className={`w-6 h-6 transition-colors ${darkMode ? 'text-white' : 'text-black'}`} />
                            </div>
                            <div>
                                <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>Intelify</span>
                                <div className={`text-[9px] font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Threat Intelligence</div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className={`text-sm font-medium transition-all relative group ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                                Features
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${darkMode ? 'bg-white' : 'bg-black'}`}></span>
                            </a>
                            <a href="#stats" className={`text-sm font-medium transition-all relative group ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                                Statistics
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${darkMode ? 'bg-white' : 'bg-black'}`}></span>
                            </a>

                            {/* Glass Divider */}
                            <div className={`h-8 w-px ${darkMode ? 'bg-slate-600/50' : 'bg-gray-400/50'}`}></div>

                            {/* Theme Toggle with glass effect */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-lg transition-all backdrop-blur-sm ${darkMode ? 'hover:bg-slate-700/50 text-gray-300 hover:text-white border border-slate-600/30' : 'hover:bg-gray-200/50 text-gray-600 hover:text-black border border-gray-300/30'}`}
                                aria-label="Toggle theme"
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Glass CTA Buttons */}
                            <Link
                                href="/login"
                                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all backdrop-blur-sm ${darkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/30' : 'text-gray-700 hover:text-black hover:bg-gray-200/50 border border-gray-300/30'}`}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-lg backdrop-blur-sm ${darkMode ? 'bg-white/90 text-black hover:bg-white border border-white/20' : 'bg-black/90 text-white hover:bg-black border border-black/20'}`}
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button with glass effect */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2.5 rounded-lg transition-all backdrop-blur-sm ${darkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/30' : 'text-gray-600 hover:text-black hover:bg-gray-200/50 border border-gray-300/30'}`}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu with glass effect */}
                {mobileMenuOpen && (
                    <div className={`md:hidden backdrop-blur-2xl border-t ${darkMode ? 'bg-slate-900/70 border-slate-700/50' : 'bg-white/70 border-gray-300/50'}`}>
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded text-sm transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}>Features</a>
                            <a href="#stats" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded text-sm transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}>Statistics</a>

                            <button onClick={toggleTheme} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}>
                                {darkMode ? <><Sun className="w-4 h-4" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
                            </button>

                            <div className="pt-3 space-y-2">
                                <Link href="/login" className={`block w-full px-5 py-2.5 text-center text-sm font-medium rounded ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>Sign In</Link>
                                <Link href="/register" className={`block w-full px-5 py-2.5 text-center text-sm font-medium rounded ${darkMode ? 'border border-gray-600 text-gray-300' : 'border border-gray-300 text-gray-700'}`}>Get Started</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Enhanced Hero Section */}
            <div className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 backdrop-blur-sm ${darkMode ? 'bg-gray-900/50 border border-gray-800 text-gray-400' : 'bg-gray-100/50 border border-gray-200 text-gray-600'}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Open-Source Threat Intelligence Platform</span>
                        </div>

                        {/* Main Heading with better spacing */}
                        <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
                            Secure Your Digital
                            <span className={`block mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Infrastructure</span>
                        </h1>

                        <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Collect, analyze, and visualize threat intelligence from multiple OSINT sources. Built for security teams who demand excellence.
                        </p>

                        {/* Enhanced CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <Link
                                href="/register"
                                className={`group px-8 py-4 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-xl ${darkMode ? 'bg-white hover:bg-gray-100 text-black shadow-white/10' : 'bg-black hover:bg-gray-900 text-white shadow-black/20'}`}
                            >
                                Start Free Trial
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/dashboard"
                                className={`px-8 py-4 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${darkMode ? 'bg-gray-900 hover:bg-gray-800 border-2 border-gray-800 hover:border-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 text-black'}`}
                            >
                                <Eye className="w-4 h-4" />
                                View Live Demo
                            </Link>
                        </div>

                        {/* Trust Indicators with icons */}
                        <div className={`flex flex-wrap justify-center gap-8 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    <Shield className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <span className="font-medium">100% Open Source</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    <Zap className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <span className="font-medium">Real-time Updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    <Lock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <span className="font-medium">Enterprise Security</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="features" className="relative py-16 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>Powerful Features</h2>
                        <p className={`text-base max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Everything you need to stay ahead of emerging threats</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { icon: <Database className="w-6 h-6" />, title: "Dynamic Source Management", desc: "Add and manage threat intelligence sources through an intuitive admin panel." },
                            { icon: <Globe className="w-6 h-6" />, title: "Global Threat Map", desc: "Visualize threats geographically with an interactive world map." },
                            { icon: <TrendingUp className="w-6 h-6" />, title: "Correlation Engine", desc: "Automatically correlate IOCs across multiple sources." },
                            { icon: <FileText className="w-6 h-6" />, title: "News Aggregation", desc: "Collect and analyze security news with automatic CVE extraction." },
                            { icon: <AlertTriangle className="w-6 h-6" />, title: "CVE Tracking", desc: "Monitor Common Vulnerabilities and Exposures with severity filtering." },
                            { icon: <Lock className="w-6 h-6" />, title: "Role-Based Access", desc: "Secure admin panel with granular permissions." }
                        ].map((feature, i) => (
                            <div key={i} className={`group relative rounded-xl p-6 transition-all duration-300 ${darkMode ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'}`}>
                                <div className={`inline-flex p-2.5 rounded-lg mb-3 transition-colors ${darkMode ? 'bg-slate-700 text-gray-300 group-hover:text-white' : 'bg-gray-200 text-gray-700 group-hover:text-black'}`}>
                                    {feature.icon}
                                </div>
                                <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{feature.title}</h3>
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div id="stats" className="relative py-16 px-4">
                <div className="container mx-auto">
                    <div className={`rounded-2xl p-8 ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-gray-100 border border-gray-200'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Free OSINT Sources", value: "4+" },
                                { label: "IOC Types Supported", value: "6" },
                                { label: "Auto Enrichment", value: "100%" },
                                { label: "Uptime", value: "99.9%" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className={`text-3xl md:text-4xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>{stat.value}</div>
                                    <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <footer className={`relative py-10 px-4 ${darkMode ? 'border-t border-slate-800' : 'border-t border-gray-200'}`}>
                <div className="container mx-auto">
                    <div className="text-center">
                        <p className={`text-sm mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Built for SOC teams, threat intelligence analysts, and security researchers</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>Using only free and open-source threat intelligence feeds</p>
                        <div className={`mt-6 text-xs ${darkMode ? 'text-gray-700' : 'text-gray-400'}`}>© 2025 Intelify. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
