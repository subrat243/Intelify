import axios from 'axios';
import { OSINTAdapter, NormalizedIndicator, IndicatorType } from './types';

export class AlienVaultAdapter implements OSINTAdapter {
    name = 'AlienVault OTX';
    sourceId = 'alienvault';
    private apiKey = process.env.ALIENVAULT_OTX_API_KEY;
    private baseUrl = 'https://otx.alienvault.com/api/v1';

    async fetchLatest(limit: number = 20): Promise<NormalizedIndicator[]> {
        if (!this.apiKey) {
            console.warn('AlienVault OTX API key is missing. Using public feed or returning mock data.');
            return this.getMockIndicators();
        }

        try {
            const response = await axios.get(`${this.baseUrl}/pulses/subscribed`, {
                headers: { 'X-OTX-API-KEY': this.apiKey },
                params: { limit }
            });

            const indicators: NormalizedIndicator[] = [];
            const pulses = response.data.results || [];

            for (const pulse of pulses) {
                const pulseIndicators = pulse.indicators || [];
                for (const ind of pulseIndicators) {
                    indicators.push({
                        type: this.mapIndicatorType(ind.type),
                        value: ind.indicator,
                        confidence: pulse.adversary ? 80 : 50,
                        riskScore: this.calculateRiskScore(ind.type, pulse.adversary),
                        description: pulse.description || `IOC from AlienVault Pulse: ${pulse.name}`,
                        tags: [...(pulse.tags || []), ...(pulse.malware_families || [])],
                        metadata: {
                            pulseId: pulse.id,
                            pulseName: pulse.name,
                            adversary: pulse.adversary,
                            references: pulse.references
                        }
                    });
                    if (indicators.length >= limit) break;
                }
                if (indicators.length >= limit) break;
            }

            return indicators;
        } catch (error) {
            console.error('AlienVault OTX Fetch Error:', error);
            return [];
        }
    }

    async searchIndicator(value: string, type: IndicatorType): Promise<NormalizedIndicator | null> {
        // Implement indicator specific search if needed
        return null;
    }

    private mapIndicatorType(otxType: string): IndicatorType {
        const mapping: { [key: string]: IndicatorType } = {
            'IPv4': 'IP',
            'IPv6': 'IP',
            'domain': 'DOMAIN',
            'hostname': 'DOMAIN',
            'URL': 'URL',
            'FileHash-MD5': 'HASH_MD5',
            'FileHash-SHA1': 'HASH_SHA1',
            'FileHash-SHA256': 'HASH_SHA256',
            'email': 'EMAIL'
        };
        return mapping[otxType] || 'DOMAIN';
    }

    private calculateRiskScore(type: string, hasAdversary: boolean): number {
        let base = 50;
        if (type.includes('Hash')) base += 20;
        if (hasAdversary) base += 20;
        return Math.min(base, 100);
    }

    private getMockIndicators(): NormalizedIndicator[] {
        return [
            {
                type: 'IP',
                value: '194.26.135.117',
                confidence: 85,
                riskScore: 92,
                description: 'Known C2 infrastructure observed in recent campaign.',
                tags: ['C2', 'CobaltStrike', 'LockBit'],
                metadata: { pulseName: 'Mock Campaign Alpha' }
            },
            {
                type: 'DOMAIN',
                value: 'secure-login-update.com',
                confidence: 90,
                riskScore: 88,
                description: 'Phishing domain impersonating banking portal.',
                tags: ['Phishing', 'CredentialHarvesting'],
                metadata: { pulseName: 'Mock Phish Cluster' }
            }
        ];
    }
}
