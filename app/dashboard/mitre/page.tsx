'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
        if (count >= 12) return 'bg-red-600';
        if (count >= 9) return 'bg-orange-600';
        if (count >= 6) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getHeatmapIntensity = (count: number) => {
        if (count >= 12) return 'opacity-100';
        if (count >= 9) return 'opacity-75';
        if (count >= 6) return 'opacity-50';
        return 'opacity-30';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">MITRE ATT&CK Framework</h1>
                <p className="text-gray-400 mt-1">Tactics and techniques heatmap</p>
            </div>

            {/* Legend */}
            <Card>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-400">Activity Level:</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-500 opacity-30 rounded"></div>
                            <span className="text-xs text-gray-400">Low (1-5)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-amber-500 opacity-50 rounded"></div>
                            <span className="text-xs text-gray-400">Medium (6-8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-600 opacity-75 rounded"></div>
                            <span className="text-xs text-gray-400">High (9-11)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 opacity-100 rounded"></div>
                            <span className="text-xs text-gray-400">Critical (12+)</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tactics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(MITRE_DATA).map(([tactic, techniques]) => (
                    <Card key={tactic} title={tactic} className="hover:border-soc-accent/50 transition-colors">
                        <div className="space-y-2">
                            {techniques.map((technique) => (
                                <div
                                    key={technique.id}
                                    className="flex items-center justify-between p-3 bg-soc-bg rounded-lg hover:bg-soc-border/30 transition-colors cursor-pointer group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-soc-accent">
                                                {technique.id}
                                            </span>
                                            <div
                                                className={`w-3 h-3 rounded ${getHeatmapColor(technique.count)} ${getHeatmapIntensity(technique.count)}`}
                                            />
                                        </div>
                                        <p className="text-sm text-foreground group-hover:text-soc-accent transition-colors truncate">
                                            {technique.name}
                                        </p>
                                    </div>
                                    <div className="ml-3 flex-shrink-0">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-soc-card border border-soc-border rounded-full text-xs font-bold text-foreground">
                                            {technique.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card className="bg-blue-500/5 border-blue-500/30">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-400 mb-1">About MITRE ATT&CK</h4>
                        <p className="text-sm text-gray-400">
                            The MITRE ATT&CK framework is a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.
                            The numbers shown represent the count of threat indicators associated with each technique in our database.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
