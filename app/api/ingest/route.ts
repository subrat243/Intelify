import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ThreatIndicatorSchema, type ApiResponse, type IngestResult } from '@/lib/types';
import { auth } from '@/lib/auth';

// Schema for bulk ingestion
const BulkIngestSchema = z.object({
    sourceName: z.string(),
    sourceType: z.enum(['FEED', 'NEWS', 'MANUAL', 'OSINT']),
    sourceUrl: z.string().url().optional(),
    indicators: z.array(ThreatIndicatorSchema),
});

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only ADMIN and ANALYST can ingest data
        if (session.user.role === 'VIEWER') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validation = BulkIngestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid input', message: validation.error.message },
                { status: 400 }
            );
        }

        const { sourceName, sourceType, sourceUrl, indicators } = validation.data;

        const result: IngestResult = {
            success: true,
            processed: indicators.length,
            created: 0,
            updated: 0,
            errors: [],
        };

        // Get or create threat source
        let source = await prisma.threatSource.findUnique({
            where: { name: sourceName },
        });

        if (!source) {
            source = await prisma.threatSource.create({
                data: {
                    name: sourceName,
                    type: sourceType,
                    url: sourceUrl,
                    reliability: 70, // Default reliability
                },
            });
        }

        // Process each indicator
        for (const indicator of indicators) {
            try {
                const existing = await prisma.threatIndicator.findUnique({
                    where: {
                        type_value: {
                            type: indicator.type,
                            value: indicator.value,
                        },
                    },
                });

                if (existing) {
                    // Update existing indicator
                    await prisma.threatIndicator.update({
                        where: { id: existing.id },
                        data: {
                            lastSeen: new Date(),
                            confidence: indicator.confidence || existing.confidence,
                            riskScore: indicator.riskScore || existing.riskScore,
                            description: indicator.description || existing.description,
                            tags: indicator.tags || existing.tags,
                            geolocation: indicator.geolocation || existing.geolocation,
                            asn: indicator.asn || existing.asn,
                            organization: indicator.organization || existing.organization,
                            sources: {
                                connect: { id: source.id },
                            },
                        },
                    });
                    result.updated++;
                } else {
                    // Create new indicator
                    await prisma.threatIndicator.create({
                        data: {
                            type: indicator.type,
                            value: indicator.value,
                            confidence: indicator.confidence || 'MEDIUM',
                            riskScore: indicator.riskScore || 50,
                            description: indicator.description,
                            tags: indicator.tags || [],
                            geolocation: indicator.geolocation,
                            asn: indicator.asn,
                            organization: indicator.organization,
                            sources: {
                                connect: { id: source.id },
                            },
                        },
                    });
                    result.created++;

                    // Create alert for high-risk indicators
                    if ((indicator.riskScore || 50) >= 80) {
                        await prisma.alert.create({
                            data: {
                                type: 'HIGH_RISK_IOC',
                                severity: 'HIGH',
                                title: `High-risk ${indicator.type} detected`,
                                description: `${indicator.value} from ${sourceName}`,
                                indicator: {
                                    connect: {
                                        type_value: {
                                            type: indicator.type,
                                            value: indicator.value,
                                        },
                                    },
                                },
                            },
                        });
                    }
                }
            } catch (error: any) {
                result.errors.push(`Failed to process ${indicator.value}: ${error.message}`);
            }
        }

        // Update source last fetched time
        await prisma.threatSource.update({
            where: { id: source.id },
            data: { lastFetchedAt: new Date() },
        });

        return NextResponse.json<ApiResponse<IngestResult>>(
            { success: true, data: result },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Ingest error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve ingestion history
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sources = await prisma.threatSource.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                reliability: true,
                lastFetchedAt: true,
                _count: {
                    select: { indicators: true },
                },
            },
            orderBy: { lastFetchedAt: 'desc' },
        });

        return NextResponse.json<ApiResponse>(
            { success: true, data: sources },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get sources error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
