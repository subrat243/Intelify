import { OSINTAdapter, NormalizedIndicator, IndicatorType } from './types';
import { AlienVaultAdapter } from './alienvault';
import { AbuseIPDBAdapter } from './abuseipdb';
import { URLhausAdapter } from './urlhaus';
import { MalwareBazaarAdapter } from './malwarebazaar';

export class IntelligenceManager {
    private adapters: OSINTAdapter[] = [];

    constructor() {
        this.adapters.push(new AlienVaultAdapter());
        this.adapters.push(new AbuseIPDBAdapter());
        this.adapters.push(new URLhausAdapter());
        this.adapters.push(new MalwareBazaarAdapter());
    }

    async ingestLatest(limitPerSource: number = 20): Promise<NormalizedIndicator[]> {
        const allIndicators: NormalizedIndicator[] = [];

        const results = await Promise.allSettled(
            this.adapters.map(adapter => adapter.fetchLatest(limitPerSource))
        );

        for (const result of results) {
            if (result.status === 'fulfilled') {
                allIndicators.push(...result.value);
            }
        }

        // Basic deduplication by value and type
        const uniqueIndicators = Array.from(
            new Map(allIndicators.map(item => [`${item.type}:${item.value}`, item])).values()
        );

        return uniqueIndicators;
    }

    async searchAll(value: string, type: IndicatorType): Promise<NormalizedIndicator[]> {
        const results = await Promise.allSettled(
            this.adapters.map(adapter => adapter.searchIndicator(value, type))
        );

        return results
            .filter((r): r is PromiseFulfilledResult<NormalizedIndicator> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);
    }
}

export const intelligenceManager = new IntelligenceManager();
