import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { CreateAlertSchema, type ApiResponse } from '@/lib/types';
import { auth } from '@/lib/auth';

// Create new alert
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

        const body = await req.json();
        const validation = CreateAlertSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid input', message: validation.error.message },
                { status: 400 }
            );
        }

        const alert = await prisma.alert.create({
            data: {
                ...validation.data,
                indicatorId: validation.data.indicatorId || null,
            },
            include: {
                indicator: {
                    select: {
                        type: true,
                        value: true,
                        riskScore: true,
                    },
                },
            },
        });

        return NextResponse.json<ApiResponse>(
            { success: true, data: alert, message: 'Alert created successfully' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create alert error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// Get alerts with filters
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
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (severity) {
            where.severity = severity;
        }

        const [alerts, total] = await Promise.all([
            prisma.alert.findMany({
                where,
                take: limit,
                skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    indicator: {
                        select: {
                            type: true,
                            value: true,
                            riskScore: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.alert.count({ where }),
        ]);

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: {
                    alerts,
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
        console.error('Get alerts error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Update alert status
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id, status, assignedToId } = await req.json();

        if (!id) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Alert ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};

        if (status) {
            updateData.status = status;

            if (status === 'ACKNOWLEDGED') {
                updateData.acknowledgedAt = new Date();
            } else if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
                updateData.resolvedAt = new Date();
            }
        }

        if (assignedToId !== undefined) {
            updateData.assignedToId = assignedToId;
        }

        const alert = await prisma.alert.update({
            where: { id },
            data: updateData,
            include: {
                indicator: {
                    select: {
                        type: true,
                        value: true,
                    },
                },
            },
        });

        return NextResponse.json<ApiResponse>(
            { success: true, data: alert, message: 'Alert updated successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update alert error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
