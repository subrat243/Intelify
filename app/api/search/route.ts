import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { type ApiResponse } from '@/lib/types';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build search filters
        const where: any = {
            OR: [
                { value: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { tags: { has: query } },
            ],
        };

        if (type) {
            where.type = type;
        }

        const [indicators, total] = await Promise.all([
            prisma.threatIndicator.findMany({
                where,
                take: limit,
                skip,
                orderBy: { lastSeen: 'desc' },
                include: {
                    sources: {
                        select: { name: true, type: true, reliability: true },
                    },
                    cves: {
                        select: { cveId: true, severity: true },
                    },
                    mitreAttacks: {
                        select: { techniqueId: true, tacticName: true, techniqueName: true },
                    },
                },
            }),
            prisma.threatIndicator.count({ where }),
        ]);

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: {
                    indicators,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                    },
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
