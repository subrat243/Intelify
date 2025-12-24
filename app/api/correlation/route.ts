import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { type ApiResponse, type CorrelationPattern } from '@/lib/types';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role === 'VIEWER') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Find indicators with shared infrastructure (same ASN, organization)
        const indicators = await prisma.threatIndicator.findMany({
            where: {
                isActive: true,
                OR: [
                    { asn: { not: null } },
                    { organization: { not: null } },
                ],
            },
            select: {
                id: true,
                type: true,
                value: true,
                asn: true,
                organization: true,
                riskScore: true,
                tags: true,
            },
        });

        // Group by ASN and organization
        const asnGroups = new Map<string, typeof indicators>();
        const orgGroups = new Map<string, typeof indicators>();

        for (const indicator of indicators) {
            if (indicator.asn) {
                const group = asnGroups.get(indicator.asn) || [];
                group.push(indicator);
                asnGroups.set(indicator.asn, group);
            }

            if (indicator.organization) {
                const group = orgGroups.get(indicator.organization) || [];
                group.push(indicator);
                orgGroups.set(indicator.organization, group);
            }
        }

        const correlations: CorrelationPattern[] = [];

        // Create correlation results for groups with 2+ indicators
        for (const [asn, group] of asnGroups.entries()) {
            if (group.length >= 2) {
                const avgRisk = Math.round(
                    group.reduce((sum, i) => sum + i.riskScore, 0) / group.length
                );

                const riskLevel =
                    avgRisk >= 80 ? 'CRITICAL' :
                        avgRisk >= 60 ? 'HIGH' :
                            avgRisk >= 40 ? 'MEDIUM' : 'LOW';

                const correlation = await prisma.correlationResult.create({
                    data: {
                        name: `ASN ${asn} Infrastructure Cluster`,
                        description: `${group.length} indicators sharing ASN ${asn}`,
                        riskLevel,
                        confidence: Math.min(90, 50 + group.length * 10),
                        indicators: {
                            connect: group.map(i => ({ id: i.id })),
                        },
                    },
                });

                correlations.push({
                    name: correlation.name,
                    indicators: group.map(i => i.value),
                    riskLevel: correlation.riskLevel,
                    confidence: correlation.confidence,
                    description: correlation.description || undefined,
                });
            }
        }

        for (const [org, group] of orgGroups.entries()) {
            if (group.length >= 2) {
                const avgRisk = Math.round(
                    group.reduce((sum, i) => sum + i.riskScore, 0) / group.length
                );

                const riskLevel =
                    avgRisk >= 80 ? 'CRITICAL' :
                        avgRisk >= 60 ? 'HIGH' :
                            avgRisk >= 40 ? 'MEDIUM' : 'LOW';

                const correlation = await prisma.correlationResult.create({
                    data: {
                        name: `${org} Infrastructure Cluster`,
                        description: `${group.length} indicators from ${org}`,
                        riskLevel,
                        confidence: Math.min(90, 50 + group.length * 10),
                        indicators: {
                            connect: group.map(i => ({ id: i.id })),
                        },
                    },
                });

                correlations.push({
                    name: correlation.name,
                    indicators: group.map(i => i.value),
                    riskLevel: correlation.riskLevel,
                    confidence: correlation.confidence,
                    description: correlation.description || undefined,
                });
            }
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: {
                    correlations,
                    count: correlations.length,
                },
                message: `Found ${correlations.length} correlation patterns`,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Correlation error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve existing correlations
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const correlations = await prisma.correlationResult.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                indicators: {
                    select: {
                        id: true,
                        type: true,
                        value: true,
                        riskScore: true,
                    },
                },
            },
            take: 50,
        });

        return NextResponse.json<ApiResponse>(
            { success: true, data: correlations },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get correlations error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
