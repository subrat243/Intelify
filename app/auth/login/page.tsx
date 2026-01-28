'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';

function LoginForm() {
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
                setError('Invalid credentials provided.');
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-2xl border border-border rounded-2xl p-8 lg:p-10 shadow-premium relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-[38px] w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <Input
                            label="Operational Identity"
                            type="email"
                            placeholder="analyst@intelify.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-[38px] w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <Input
                            label="Secure Access Key"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-11"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 rounded-xl group bg-primary text-primary-foreground"
                    disabled={loading}
                >
                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                        {loading ? 'Processing...' : 'Authorize Uplink'}
                    </span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />}
                </Button>
            </form>

            <div className="mt-8 p-4 bg-slate-50 border border-border rounded-xl relative z-10">
                <p className="text-[9px] text-primary font-black uppercase tracking-widest mb-2.5 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Operational Node Access
                </p>
                <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 font-bold flex justify-between">
                        <span className="uppercase tracking-widest">ID:</span>
                        <span className="text-slate-900 font-mono text-[11px]">admin@intelify.com</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold flex justify-between">
                        <span className="uppercase tracking-widest">KEY:</span>
                        <span className="text-slate-900 font-mono text-[11px]">admin123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-display">
            {/* Soft Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelify</h2>
                    <p className="mt-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        Operational Core Gateway
                    </p>
                </div>

                <Suspense fallback={
                    <div className="bg-white/80 backdrop-blur-2xl border border-border rounded-3xl p-20 flex flex-col items-center justify-center space-y-4">
                        <Loader className="p-0 scale-75" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse mt-4">Establishing Secure Channel...</p>
                    </div>
                }>
                    <LoginForm />
                </Suspense>

                {/* Footer */}
                <p className="mt-8 text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                    End-to-End Encryption Enabled
                </p>
            </div>
        </div>
    );
}
