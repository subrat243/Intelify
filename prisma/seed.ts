import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@intelify.com' },
        update: {},
        create: {
            email: 'admin@intelify.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create analyst user
    const analystPassword = await bcrypt.hash('analyst123', 10);
    const analyst = await prisma.user.upsert({
        where: { email: 'analyst@intelify.com' },
        update: {},
        create: {
            email: 'analyst@intelify.com',
            name: 'Security Analyst',
            password: analystPassword,
            role: 'ANALYST',
        },
    });
    console.log('✅ Created analyst user:', analyst.email);

    // Create viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    const viewer = await prisma.user.upsert({
        where: { email: 'viewer@intelify.com' },
        update: {},
        create: {
            email: 'viewer@intelify.com',
            name: 'Viewer User',
            password: viewerPassword,
            role: 'VIEWER',
        },
    });
    console.log('✅ Created viewer user:', viewer.email);

    // Create threat sources
    const sources = [
        { name: 'AlienVault OTX', type: 'FEED', url: 'https://otx.alienvault.com', reliability: 85 },
        { name: 'AbuseIPDB', type: 'FEED', url: 'https://www.abuseipdb.com', reliability: 90 },
        { name: 'URLhaus', type: 'FEED', url: 'https://urlhaus.abuse.ch', reliability: 88 },
        { name: 'The Hacker News', type: 'NEWS', url: 'https://thehackernews.com', reliability: 80 },
    ];

    for (const source of sources) {
        await prisma.threatSource.upsert({
            where: { name: source.name },
            update: {},
            create: source as any,
        });
    }
    console.log('✅ Created threat sources');

    // Create sample threat indicators
    const sampleSource = await prisma.threatSource.findFirst();
    if (sampleSource) {
        const indicators = [
            {
                type: 'IP',
                value: '192.0.2.1',
                confidence: 'HIGH',
                riskScore: 85,
                description: 'Known C2 server',
                tags: ['malware', 'c2'],
                geolocation: 'Russia',
                asn: 'AS12345',
                organization: 'Example Hosting',
            },
            {
                type: 'DOMAIN',
                value: 'malicious-example.com',
                confidence: 'CRITICAL',
                riskScore: 95,
                description: 'Phishing domain',
                tags: ['phishing', 'credential-theft'],
            },
            {
                type: 'HASH_SHA256',
                value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                confidence: 'HIGH',
                riskScore: 80,
                description: 'Ransomware payload',
                tags: ['ransomware', 'malware'],
            },
        ];

        for (const indicator of indicators) {
            await prisma.threatIndicator.upsert({
                where: {
                    type_value: {
                        type: indicator.type as any,
                        value: indicator.value,
                    },
                },
                update: {},
                create: {
                    ...indicator,
                    sources: {
                        connect: { id: sampleSource.id },
                    },
                } as any,
            });
        }
        console.log('✅ Created sample threat indicators');
    }

    // Create sample CVEs
    const cves = [
        {
            cveId: 'CVE-2024-1234',
            description: 'Critical remote code execution vulnerability',
            severity: 'CRITICAL',
            cvssScore: 9.8,
            publishedDate: new Date('2024-01-15'),
            lastModified: new Date('2024-01-20'),
            affectedProducts: ['Apache Tomcat 9.0.x', 'Apache Tomcat 10.1.x'],
        },
        {
            cveId: 'CVE-2024-5678',
            description: 'SQL injection vulnerability',
            severity: 'HIGH',
            cvssScore: 8.1,
            publishedDate: new Date('2024-02-10'),
            lastModified: new Date('2024-02-15'),
            affectedProducts: ['WordPress Plugin XYZ < 2.0'],
        },
    ];

    for (const cve of cves) {
        await prisma.cVE.upsert({
            where: { cveId: cve.cveId },
            update: {},
            create: cve as any,
        });
    }
    console.log('✅ Created sample CVEs');

    // Create sample MITRE ATT&CK techniques
    const mitreAttacks = [
        {
            techniqueId: 'T1566.001',
            tacticName: 'Initial Access',
            techniqueName: 'Spearphishing Attachment',
            description: 'Adversaries may send spearphishing emails with a malicious attachment',
            url: 'https://attack.mitre.org/techniques/T1566/001/',
        },
        {
            techniqueId: 'T1059.001',
            tacticName: 'Execution',
            techniqueName: 'PowerShell',
            description: 'Adversaries may abuse PowerShell commands and scripts',
            url: 'https://attack.mitre.org/techniques/T1059/001/',
        },
    ];

    for (const attack of mitreAttacks) {
        await prisma.mitreAttack.upsert({
            where: { techniqueId: attack.techniqueId },
            update: {},
            create: attack,
        });
    }
    console.log('✅ Created sample MITRE ATT&CK techniques');

    // Create sample alerts
    const highRiskIndicator = await prisma.threatIndicator.findFirst({
        where: { riskScore: { gte: 80 } },
    });

    if (highRiskIndicator) {
        await prisma.alert.create({
            data: {
                type: 'HIGH_RISK_IOC',
                severity: 'HIGH',
                status: 'NEW',
                title: 'High-risk IP detected',
                description: `Detected high-risk IP address: ${highRiskIndicator.value}`,
                indicatorId: highRiskIndicator.id,
            },
        });
        console.log('✅ Created sample alert');
    }

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
