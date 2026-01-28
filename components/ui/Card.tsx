import { LucideIcon } from 'lucide-react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    icon?: LucideIcon;
    className?: string;
    description?: string;
}

export function Card({ children, title, icon: Icon, className = "", description }: CardProps) {
    const getSeverityStyles = (severity?: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-200';
            case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'LOW': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'INFO': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };
    return (
        <div className={`bg-white border border-border rounded-2xl p-5 shadow-premium hover:shadow-lg transition-all duration-300 group relative overflow-hidden ${className}`}>
            {/* Holographic shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {(title || Icon) && (
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            {Icon && (
                                <div className="p-2 rounded-lg cosmic-gradient text-white group-hover:scale-110 transition-transform duration-300">
                                    <Icon size={14} strokeWidth={2.5} />
                                </div>
                            )}
                            <div>
                                {title && (
                                    <h3 className="text-[9px] font-black tracking-[0.2em] text-foreground uppercase font-display text-gradient">
                                        {title}
                                    </h3>
                                )}
                                {description && (
                                    <p className="text-[7px] text-muted-foreground/60 font-bold uppercase tracking-wider mt-0.5">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
