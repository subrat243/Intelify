'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Target, Info, Shield, Layers, Activity, ChevronRight, Zap, ArrowRight } from 'lucide-react';

// MITRE ATT&CK Tactics and Techniques (sample data)
const MITRE_DATA = {
    'Initial Access': [
        { id: 'T1566', name: 'Phishing', count: 12 },
        { id: 'T1190', name: 'Exploit Public-Facing Application', count: 8 },
        { id: 'T1133', name: 'External Remote Services', count: 5 },
    ],
    'Execution': [
        { id: 'T1059', name: 'Command and Scripting Interpreter', count: 15 },
        { id: 'T1203', name: 'Exploitation for Client Execution', count: 7 },
        { id: 'T1204', name: 'User Execution', count: 10 },
    ],
    'Persistence': [
        { id: 'T1547', name: 'Boot or Logon Autostart Execution', count: 9 },
        { id: 'T1053', name: 'Scheduled Task/Job', count: 11 },
        { id: 'T1136', name: 'Create Account', count: 6 },
    ],
    'Privilege Escalation': [
        { id: 'T1068', name: 'Exploitation for Privilege Escalation', count: 8 },
        { id: 'T1078', name: 'Valid Accounts', count: 13 },
        { id: 'T1055', name: 'Process Injection', count: 7 },
    ],
    'Defense Evasion': [
        { id: 'T1562', name: 'Impair Defenses', count: 10 },
        { id: 'T1070', name: 'Indicator Removal', count: 9 },
        { id: 'T1027', name: 'Obfuscated Files or Information', count: 14 },
    ],
    'Credential Access': [
        { id: 'T1110', name: 'Brute Force', count: 11 },
        { id: 'T1555', name: 'Credentials from Password Stores', count: 6 },
        { id: 'T1003', name: 'OS Credential Dumping', count: 8 },
    ],
    'Discovery': [
        { id: 'T1083', name: 'File and Directory Discovery', count: 7 },
        { id: 'T1082', name: 'System Information Discovery', count: 9 },
        { id: 'T1018', name: 'Remote System Discovery', count: 5 },
    ],
    'Lateral Movement': [
        { id: 'T1021', name: 'Remote Services', count: 10 },
        { id: 'T1080', name: 'Taint Shared Content', count: 4 },
        { id: 'T1091', name: 'Replication Through Removable Media', count: 3 },
    ],
    'Collection': [
        { id: 'T1560', name: 'Archive Collected Data', count: 6 },
        { id: 'T1113', name: 'Screen Capture', count: 5 },
        { id: 'T1005', name: 'Data from Local System', count: 8 },
    ],
    'Command and Control': [
        { id: 'T1071', name: 'Application Layer Protocol', count: 12 },
        { id: 'T1573', name: 'Encrypted Channel', count: 9 },
        { id: 'T1090', name: 'Proxy', count: 7 },
    ],
    'Exfiltration': [
        { id: 'T1041', name: 'Exfiltration Over C2 Channel', count: 8 },
        { id: 'T1567', name: 'Exfiltration Over Web Service', count: 6 },
        { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', count: 4 },
    ],
    'Impact': [
        { id: 'T1486', name: 'Data Encrypted for Impact', count: 10 },
        { id: 'T1490', name: 'Inhibit System Recovery', count: 5 },
        { id: 'T1489', name: 'Service Stop', count: 7 },
    ],
};

export default function MitrePage() {
    const getHeatmapColor = (count: number) => {
        if (count >= 12) return 'bg-primary text-primary-foreground px-3';
        if (count >= 9) return 'bg-primary/70 text-white px-3';
        if (count >= 6) return 'bg-primary/30 text-primary px-3';
        return 'bg-slate-50 text-slate-400 px-3';
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-100 pb-12">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-5">
                        <Target className="w-3 h-3 fill-current" />
                        Tactical Mapping
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-black">ATT&CK Matrix</h1>
                    <p className="text-neutral-500 mt-4 font-bold text-sm max-w-2xl uppercase tracking-widest opacity-60">Visualizing behavioral patterns across the threat landscape.</p>
                </div>
                <div className="flex items-center gap-6 px-6 py-4 bg-white border border-neutral-100 rounded-[20px] shadow-sm hidden lg:flex">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Density Gradient:</span>
                    <div className="flex items-center gap-3">
                        {[
                            { color: 'bg-slate-50', label: 'Low' },
                            { color: 'bg-primary/30', label: 'Mid' },
                            { color: 'bg-primary/70', label: 'High' },
                            { color: 'bg-primary', label: 'Crit' },
                        ].map(level => (
                            <div key={level.label} className="flex items-center gap-2 group cursor-default">
                                <div className={`w-3 h-3 rounded-full ${level.color} border border-neutral-200`} />
                                <span className="text-[9px] font-black uppercase text-neutral-300 group-hover:text-primary transition-colors">{level.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tactics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {Object.entries(MITRE_DATA).map(([tactic, techniques]) => (
                    <div key={tactic} className="group relative bg-white border border-neutral-100 rounded-[32px] p-8 flex flex-col hover:border-primary/30 transition-all duration-500 hover:shadow-premium">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                    <Layers className="w-4 h-4 text-neutral-300 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-400 group-hover:text-primary transition-colors">
                                    {tactic}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            {techniques.map((technique) => (
                                <div
                                    key={technique.id}
                                    className="relative flex items-center justify-between p-4 bg-slate-50/50 border border-neutral-100 rounded-2xl hover:bg-slate-50 transition-all group/item cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[9px] font-black text-primary tracking-widest bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded-md uppercase">
                                                {technique.id}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-tight group-hover/item:text-black transition-colors leading-tight truncate">
                                            {technique.name}
                                        </p>
                                    </div>
                                    <div className={`shrink-0 h-10 min-w-10 rounded-xl flex items-center justify-center text-[11px] font-black border border-neutral-100 transition-all duration-300 ${getHeatmapColor(technique.count)}`}>
                                        {technique.count}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-neutral-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">{techniques.length} Techniques</span>
                            <ArrowRight className="w-4 h-4 text-neutral-200 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Analysis Methodology */}
            <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Shield className="w-44 h-44 text-primary" />
                </div>
                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center shrink-0 border border-primary/20 shadow-glow">
                        <Zap className="w-8 h-8 text-primary fill-current" />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xl font-black text-black flex items-center gap-4 uppercase tracking-tighter">
                            Intelligence Protocol
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">System Verified</span>
                        </h4>
                        <p className="text-sm text-neutral-400 leading-relaxed max-w-5xl font-bold uppercase tracking-widest opacity-80 italic">
                            Tactical behaviors are synthesized against the MITRE ATT&CK framework. Density is a direct reflection of signal intensity across specific behavioral vectors. High-density regions indicate strategic adversary focus within the telemetry perimeter.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
