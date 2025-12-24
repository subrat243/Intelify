'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
    source: { name: string };
    cves: { cveId: string; severity: string }[];
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await fetch('/api/news');
            const data = await response.json();
            if (data.success) {
                setNews(data.data.news);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setFetching(true);
        try {
            const response = await fetch('/api/news', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                await fetchNews();
            }
        } catch (error) {
            console.error('Failed to refresh news:', error);
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">News Intelligence</h1>
                    <p className="text-gray-400 mt-1">Latest security news and updates</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleRefresh}
                    disabled={fetching}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
                    {fetching ? 'Fetching...' : 'Refresh Feeds'}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading news...</div>
            ) : news.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-4">No news articles found</p>
                        <Button variant="primary" onClick={handleRefresh}>
                            Fetch Latest News
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {news.map((item) => (
                        <Card key={item.id} className="hover:border-soc-accent/50 transition-colors">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-foreground hover:text-soc-accent transition-colors">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            {item.title}
                                        </a>
                                    </h3>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-soc-accent hover:text-blue-400 flex-shrink-0"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>

                                <p className="text-sm text-gray-400 line-clamp-3">{item.summary}</p>

                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <span className="text-xs text-gray-500">
                                        {item.source.name}
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.publishedAt).toLocaleDateString()}
                                    </span>

                                    {item.cves.length > 0 && (
                                        <>
                                            <span className="text-xs text-gray-500">•</span>
                                            <div className="flex flex-wrap gap-2">
                                                {item.cves.map((cve) => (
                                                    <Badge key={cve.cveId} severity={cve.severity as any}>
                                                        {cve.cveId}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
