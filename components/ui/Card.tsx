import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
}

export function Card({ children, className = '', title, description }: CardProps) {
    return (
        <div className={`bg-soc-card border border-soc-border rounded-lg p-6 ${className}`}>
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-400 mt-1">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
