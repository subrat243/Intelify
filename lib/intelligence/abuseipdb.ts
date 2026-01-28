import axios from 'axios';
import { OSINTAdapter, NormalizedIndicator, IndicatorType } from './types';

export class AbuseIPDBAdapter implements OSINTAdapter {
    name = 'AbuseIPDB';
    sourceId = 'abuseipdb';
    private apiKey = process.env.ABUSEIPDB_API_KEY;
    private baseUrl = 'https://api.abuseipdb.com/api/v2';

    async fetchLatest(limit: number = 20): Promise<NormalizedIndicator[]> {
        if (!this.apiKey) {
            console.warn('AbuseIPDB API key is missing. Returning mock data.');
            return this.getMockIndicators();
        }

        try {
            const response = await axios.get(`${this.baseUrl}/blacklist`, {
                headers: { 'Key': this.apiKey, 'Accept': 'application/json' },
                params: { limit, confidenceMinimum: 75 }
            });

            const indicators: NormalizedIndicator[] = [];
            const entries = response.data.data || [];

            for (const entry of entries) {
                indicators.push({
                    type: 'IP',
                    value: entry.ipAddress,
                    confidence: entry.abuseConfidenceScore,
                    riskScore: entry.abuseConfidenceScore,
                    description: `High-risk IP reported in AbuseIPDB. Categories: ${entry.abuseCategories?.join(', ') || 'General Abuse'}`,
                    tags: ['AbusiveIP', 'ReputationLow'],
                    metadata: {
                        totalReports: entry.totalReports,
                        lastReportedAt: entry.lastReportedAt
                    }
                });
            }

            return indicators;
        } catch (error) {
            console.error('AbuseIPDB Fetch Error:', error);
            return [];
        }
    }

    async searchIndicator(value: string, type: IndicatorType): Promise<NormalizedIndicator | null> {
        if (type !== 'IP' || !this.apiKey) return null;

        try {
            const response = await axios.get(`${this.baseUrl}/check`, {
                headers: { 'Key': this.apiKey, 'Accept': 'application/json' },
                params: { ipAddress: value, maxAgeInDays: 90 }
            });

            const entry = response.data.data;
            return {
                type: 'IP',
                value: entry.ipAddress,
                confidence: entry.abuseConfidenceScore,
                riskScore: entry.abuseConfidenceScore,
                description: `IP Check for ${value}: ${entry.totalReports} total reports.`,
                tags: entry.abuseConfidenceScore > 50 ? ['Reported', 'HighRisk'] : ['Clean/LowRisk'],
                metadata: entry
            };
        } catch (error) {
            console.error('AbuseIPDB Search Error:', error);
            return null;
        }
    }

    private getMockIndicators(): NormalizedIndicator[] {
        return [
            {
                type: 'IP',
                value: '45.15.118.212',
                confidence: 98,
                riskScore: 98,
                description: 'Mock: Highly reported malicious IP from AbuseIPDB.',
                tags: ['AbusiveIP', 'SSH-Bruteforce'],
                metadata: { totalReports: 1450 }
            }
        ];
    }
}
