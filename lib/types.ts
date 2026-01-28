import { z } from 'zod';

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ============================================
// Threat Indicator Types
// ============================================

export const IndicatorTypeEnum = z.enum([
    'IP',
    'DOMAIN',
    'URL',
    'HASH_MD5',
    'HASH_SHA1',
    'HASH_SHA256',
    'EMAIL',
    'FILE_PATH',
]);

export const ConfidenceLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const ThreatIndicatorSchema = z.object({
    type: IndicatorTypeEnum,
    value: z.string().min(1),
    confidence: ConfidenceLevelEnum.optional(),
    riskScore: z.number().min(0).max(100).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    geolocation: z.string().optional(),
    asn: z.string().optional(),
    organization: z.string().optional(),
});

export type ThreatIndicatorInput = z.infer<typeof ThreatIndicatorSchema>;

// ============================================
// Alert Types
// ============================================

export const AlertTypeEnum = z.enum([
    'HIGH_RISK_IOC',
    'CVE_CRITICAL',
    'CORRELATION_MATCH',
    'UNUSUAL_ACTIVITY',
    'CUSTOM',
]);

export const AlertSeverityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const AlertStatusEnum = z.enum([
    'NEW',
    'ACKNOWLEDGED',
    'IN_PROGRESS',
    'RESOLVED',
    'FALSE_POSITIVE',
]);

export const CreateAlertSchema = z.object({
    type: AlertTypeEnum,
    severity: AlertSeverityEnum,
    title: z.string().min(1),
    description: z.string().optional(),
    indicatorId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;

// ============================================
// Search Types
// ============================================

export interface SearchFilters {
    type?: string;
    confidence?: string;
    minRiskScore?: number;
    maxRiskScore?: number;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
}

export interface SearchParams {
    query: string;
    filters?: SearchFilters;
    page?: number;
    limit?: number;
}

// ============================================
// Feed Ingestion Types
// ============================================

export interface FeedConfig {
    name: string;
    type: 'FEED' | 'NEWS' | 'MANUAL' | 'OSINT';
    url: string;
    format: 'json' | 'csv' | 'stix' | 'rss';
    reliability: number;
}

export interface IngestResult {
    success: boolean;
    processed: number;
    created: number;
    updated: number;
    errors: string[];
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStats {
    totalIndicators: number;
    highRiskIndicators: number;
    activeAlerts: number;
    criticalCVEs: number;
    indicatorsByType: Record<string, number>;
    indicatorsByConfidence: Record<string, number>;
    recentActivity: {
        date: string;
        count: number;
    }[];
    recentAlerts: {
        id: string;
        title: string;
        severity: string;
        status: string;
        createdAt: string;
    }[];
}

// ============================================
// Correlation Types
// ============================================

export interface CorrelationPattern {
    name: string;
    indicators: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    description?: string;
}

// ============================================
// User Types
// ============================================

export const UserRoleEnum = z.enum(['ADMIN', 'ANALYST', 'VIEWER']);

export interface UserSession {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'ANALYST' | 'VIEWER';
}
