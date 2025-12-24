'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-soc-bg px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-soc-accent/10 rounded-full">
                            <Shield className="w-12 h-12 text-soc-accent" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Intelify TIP</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Threat Intelligence Platform
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-soc-card border border-soc-border rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="analyst@intelify.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
                        <p className="text-xs text-blue-400 font-medium mb-2">Demo Credentials:</p>
                        <p className="text-xs text-gray-400">
                            Email: <span className="text-blue-400">admin@intelify.com</span>
                            <br />
                            Password: <span className="text-blue-400">admin123</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    Secure access to threat intelligence data
                </p>
            </div>
        </div>
    );
}
