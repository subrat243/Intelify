import React from 'react';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'NONE';

interface BadgeProps {
    severity: Severity;
    children: React.ReactNode;
    className?: string;
}

export function Badge({ severity, children, className = '' }: BadgeProps) {
    const severityStyles = {
        CRITICAL: 'severity-critical',
        HIGH: 'severity-high',
        MEDIUM: 'severity-medium',
        LOW: 'severity-low',
        INFO: 'severity-info',
        NONE: 'bg-gray-600 text-white',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityStyles[severity]} ${className}`}
        >
            {children}
        </span>
    );
}
