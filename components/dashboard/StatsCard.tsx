'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
}

export function StatsCard({
    title,
    value,
    description,
    trend,
    trendValue,
    icon,
}: StatsCardProps) {
    const trendIcons = {
        up: <TrendingUp className="w-4 h-4" />,
        down: <TrendingDown className="w-4 h-4" />,
        neutral: <Minus className="w-4 h-4" />,
    };

    const trendColors = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-gray-400',
    };

    return (
        <Card className="hover:border-soc-accent/50 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
                    {description && (
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColors[trend]}`}>
                            {trendIcons[trend]}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 bg-soc-accent/10 rounded-lg text-soc-accent">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
