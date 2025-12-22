'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Lock, User, Mail, Sun, Moon } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function RegisterPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [darkMode, setDarkMode] = useState(true)

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!username || !email || !password || !confirmPassword) {
            setError('All fields are required')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        setLoading(true)

        try {
            await apiClient.register(username, email, password)
            await apiClient.login(username, password)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Background pattern */}
            <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 opacity-50' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white opacity-50'}`}></div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-6 right-6 p-3 rounded-lg transition-all backdrop-blur-sm z-50 ${darkMode ? 'hover:bg-slate-700/50 text-gray-300 hover:text-white border border-slate-600/30' : 'hover:bg-gray-200/50 text-gray-600 hover:text-black border border-gray-300/30'}`}
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="max-w-md w-full relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-xl backdrop-blur-sm ${darkMode ? 'bg-slate-800/60 border border-slate-600/30' : 'bg-white/60 border border-gray-300/30 shadow-sm'}`}>
                            <Shield className={`w-10 h-10 ${darkMode ? 'text-white' : 'text-black'}`} />
                        </div>
                        <div className="text-left">
                            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Intelify</span>
                            <div className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Threat Intelligence</div>
                        </div>
                    </Link>
                    <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Create Account
                    </h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign up to get started</p>
                </div>

                {/* Registration Form */}
                <div className={`backdrop-blur-xl rounded-2xl p-8 border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-gray-300/50 shadow-xl'}`}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className={`px-4 py-3 rounded-lg border ${darkMode ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Username
                            </label>
                            <div className="relative">
                                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20' : 'bg-white/50 border-gray-300 text-black placeholder-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20'}`}
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20' : 'bg-white/50 border-gray-300 text-black placeholder-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20'}`}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20' : 'bg-white/50 border-gray-300 text-black placeholder-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20'}`}
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20' : 'bg-white/50 border-gray-300 text-black placeholder-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20'}`}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all shadow-lg ${darkMode ? 'bg-white/90 text-black hover:bg-white disabled:bg-gray-600 disabled:text-gray-400' : 'bg-black/90 text-white hover:bg-black disabled:bg-gray-300 disabled:text-gray-500'} disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Already have an account?{' '}
                        <Link href="/login" className={`font-semibold ${darkMode ? 'text-white hover:text-gray-200' : 'text-black hover:text-gray-800'}`}>
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className={`mt-6 text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    <Link href="/" className={`${darkMode ? 'hover:text-gray-400' : 'hover:text-gray-800'}`}>
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
