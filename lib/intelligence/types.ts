export type IndicatorType = 'IP' | 'DOMAIN' | 'URL' | 'HASH_MD5' | 'HASH_SHA1' | 'HASH_SHA256' | 'EMAIL' | 'FILE_PATH';

export interface NormalizedIndicator {
    type: IndicatorType;
    value: string;
    confidence: number; // 0-100
    riskScore: number; // 0-100
    description?: string;
    tags: string[];
    metadata?: any;
}

export interface IntelSource {
    name: string;
    id: string;
}

export interface OSINTAdapter {
    name: string;
    sourceId: string;
    fetchLatest(limit?: number): Promise<NormalizedIndicator[]>;
    searchIndicator(value: string, type: IndicatorType): Promise<NormalizedIndicator | null>;
}
