interface BadgeProps {
    children: React.ReactNode;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO';
    className?: string;
}

export function Badge({ children, severity, className = "" }: BadgeProps) {
    const getSeverityStyles = (severity?: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'INFO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-white/5 text-muted-foreground border-white/10';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityStyles(severity)} ${className}`}>
            {children}
        </span>
    );
}
