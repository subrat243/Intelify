import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { type ApiResponse, type DashboardStats } from '@/lib/types';
import { auth } from '@/lib/auth';
import { subDays, format } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get date range for recent activity (last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7);

        // Fetch all stats in parallel
        const [
            totalIndicators,
            highRiskIndicators,
            activeAlerts,
            criticalCVEs,
            indicatorsByType,
            indicatorsByConfidence,
            recentIndicators,
            recentAlertsData,
        ] = await Promise.all([
            // Total indicators
            prisma.threatIndicator.count({ where: { isActive: true } }),

            // High-risk indicators (risk score >= 70)
            prisma.threatIndicator.count({
                where: { isActive: true, riskScore: { gte: 70 } },
            }),

            // Active alerts (NEW or ACKNOWLEDGED or IN_PROGRESS)
            prisma.alert.count({
                where: { status: { in: ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'] } },
            }),

            // Critical CVEs
            prisma.cVE.count({ where: { severity: 'CRITICAL' } }),

            // Indicators by type
            prisma.threatIndicator.groupBy({
                by: ['type'],
                where: { isActive: true },
                _count: true,
            }),

            // Indicators by confidence
            prisma.threatIndicator.groupBy({
                by: ['confidence'],
                where: { isActive: true },
                _count: true,
            }),

            // Recent indicators (last 7 days) grouped by date
            prisma.threatIndicator.findMany({
                where: {
                    firstSeen: { gte: sevenDaysAgo },
                },
                select: {
                    firstSeen: true,
                },
            }),

            // Recent alerts (5 most recent)
            prisma.alert.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    severity: true,
                    status: true,
                    createdAt: true,
                },
            }),
        ]);

        // Process indicators by type
        const typeStats: Record<string, number> = {};
        for (const item of indicatorsByType) {
            typeStats[item.type] = item._count;
        }

        // Process indicators by confidence
        const confidenceStats: Record<string, number> = {};
        for (const item of indicatorsByConfidence) {
            confidenceStats[item.confidence] = item._count;
        }

        // Process recent activity by date
        const activityMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
            activityMap.set(date, 0);
        }

        for (const indicator of recentIndicators) {
            const date = format(new Date(indicator.firstSeen), 'yyyy-MM-dd');
            if (activityMap.has(date)) {
                activityMap.set(date, (activityMap.get(date) || 0) + 1);
            }
        }

        const recentActivity = Array.from(activityMap.entries()).map(([date, count]) => ({
            date,
            count,
        }));

        const stats: DashboardStats = {
            totalIndicators,
            highRiskIndicators,
            activeAlerts,
            criticalCVEs,
            indicatorsByType: typeStats,
            indicatorsByConfidence: confidenceStats,
            recentActivity,
            recentAlerts: recentAlertsData.map(alert => ({
                ...alert,
                createdAt: alert.createdAt.toISOString(),
            })),
        };

        return NextResponse.json<ApiResponse<DashboardStats>>(
            { success: true, data: stats },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
