import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { intelligenceManager } from '@/lib/intelligence';

export async function POST() {
    try {
        const session = await auth();
        if (!session || session.user.role === 'VIEWER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const indicators = await intelligenceManager.ingestLatest(30);

        let createdCount = 0;

        for (const indicator of indicators) {
            try {
                await prisma.threatIndicator.upsert({
                    where: {
                        type_value: {
                            type: indicator.type as any,
                            value: indicator.value
                        }
                    },
                    update: {
                        confidence: mapConfidence(indicator.confidence),
                        riskScore: indicator.riskScore,
                        description: indicator.description,
                        tags: indicator.tags,
                        lastSeen: new Date(),
                        // isActive is true by default
                    },
                    create: {
                        type: indicator.type as any,
                        value: indicator.value,
                        confidence: mapConfidence(indicator.confidence),
                        riskScore: indicator.riskScore,
                        description: indicator.description,
                        tags: indicator.tags,
                        firstSeen: new Date(),
                        lastSeen: new Date(),
                    }
                });
                createdCount++; // Simple count for summary
            } catch (err) {
                console.error(`Failed to ingest indicator ${indicator.value}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ingested: indicators.length,
                processed: createdCount,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Intelligence Sync Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

function mapConfidence(score: number): any {
    if (score >= 90) return 'CRITICAL';
    if (score >= 75) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
}
