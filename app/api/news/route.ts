import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { type ApiResponse } from '@/lib/types';
import { auth } from '@/lib/auth';
import Parser from 'rss-parser';

const parser = new Parser();

// Cybersecurity news RSS feeds
const NEWS_FEEDS = [
    { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
    { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
    { name: 'Cyber Security News', url: 'https://feeds.feedburner.com/cyber-security-news' },
];

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

        const { feedUrl, feedName } = await req.json();

        // Use provided feed or default feeds
        const feedsToFetch = feedUrl && feedName
            ? [{ name: feedName, url: feedUrl }]
            : NEWS_FEEDS;

        let totalFetched = 0;
        const errors: string[] = [];

        for (const feed of feedsToFetch) {
            try {
                // Get or create source
                let source = await prisma.threatSource.findUnique({
                    where: { name: feed.name },
                });

                if (!source) {
                    source = await prisma.threatSource.create({
                        data: {
                            name: feed.name,
                            type: 'NEWS',
                            url: feed.url,
                            reliability: 80,
                        },
                    });
                }

                // Fetch RSS feed
                const rssFeed = await parser.parseURL(feed.url);

                // Process each news item
                for (const item of rssFeed.items.slice(0, 20)) { // Limit to 20 most recent
                    if (!item.link) continue;

                    // Check if news already exists
                    const existing = await prisma.threatNews.findUnique({
                        where: { url: item.link },
                    });

                    if (!existing) {
                        // Extract CVE mentions from title and content
                        const text = `${item.title} ${item.contentSnippet || item.content || ''}`;
                        const cveMatches = text.match(/CVE-\d{4}-\d{4,7}/gi) || [];

                        await prisma.threatNews.create({
                            data: {
                                title: item.title || 'Untitled',
                                summary: item.contentSnippet?.slice(0, 500),
                                content: item.content,
                                url: item.link,
                                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                                author: item.creator || item.author,
                                sourceId: source.id,
                            },
                        });

                        totalFetched++;

                        // Link CVEs if found
                        for (const cveId of cveMatches) {
                            const cve = await prisma.cVE.findUnique({
                                where: { cveId: cveId.toUpperCase() },
                            });

                            if (cve) {
                                await prisma.threatNews.update({
                                    where: { url: item.link },
                                    data: {
                                        cves: {
                                            connect: { id: cve.id },
                                        },
                                    },
                                });
                            }
                        }
                    }
                }

                // Update source last fetched time
                await prisma.threatSource.update({
                    where: { id: source.id },
                    data: { lastFetchedAt: new Date() },
                });

            } catch (error: any) {
                errors.push(`Failed to fetch ${feed.name}: ${error.message}`);
            }
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: { fetched: totalFetched, errors },
                message: `Fetched ${totalFetched} news articles`,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('News fetch error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve news
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [news, total] = await Promise.all([
            prisma.threatNews.findMany({
                take: limit,
                skip,
                orderBy: { publishedAt: 'desc' },
                include: {
                    source: {
                        select: { name: true, type: true },
                    },
                    cves: {
                        select: { cveId: true, severity: true },
                    },
                },
            }),
            prisma.threatNews.count(),
        ]);

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: {
                    news,
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
        console.error('Get news error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
