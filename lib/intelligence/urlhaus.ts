import axios from 'axios';
import { OSINTAdapter, NormalizedIndicator, IndicatorType } from './types';

export class URLhausAdapter implements OSINTAdapter {
    name = 'URLhaus';
    sourceId = 'urlhaus';
    private baseUrl = 'https://urlhaus-api.abuse.ch/v1';

    async fetchLatest(limit: number = 20): Promise<NormalizedIndicator[]> {
        try {
            // URLhaus has a public JSON feed for recent URLs
            const response = await axios.get('https://urlhaus.abuse.ch/api/v1/urls/recent/');

            const indicators: NormalizedIndicator[] = [];
            const urls = response.data.urls || [];

            for (const entry of urls) {
                indicators.push({
                    type: 'URL',
                    value: entry.url,
                    confidence: 90, // URLhaus is high trust
                    riskScore: entry.url_status === 'online' ? 95 : 70,
                    description: `Malicious URL detected by URLhaus. Malware: ${entry.threat || 'Unknown'}. Status: ${entry.url_status}`,
                    tags: entry.tags || ['MaliciousURL'],
                    metadata: {
                        reporter: entry.reporter,
                        status: entry.url_status,
                        threat: entry.threat,
                        urlhausReference: entry.urlhaus_reference
                    }
                });
                if (indicators.length >= limit) break;
            }

            return indicators;
        } catch (error) {
            console.error('URLhaus Fetch Error:', error);
            return [];
        }
    }

    async searchIndicator(value: string, type: IndicatorType): Promise<NormalizedIndicator | null> {
        if (type !== 'URL' && type !== 'DOMAIN') return null;
        return null; // Search requires a more complex API interaction for URLhaus
    }
}
