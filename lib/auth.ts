import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/db';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const { email, password } = loginSchema.parse(credentials);

                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Update last login
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLoginAt: new Date() },
                    });

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'ADMIN' | 'ANALYST' | 'VIEWER';
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper function to check user role
export async function checkRole(allowedRoles: ('ADMIN' | 'ANALYST' | 'VIEWER')[]) {
    const session = await auth();

    if (!session || !session.user) {
        return { authorized: false, user: null };
    }

    const authorized = allowedRoles.includes(session.user.role);

    return { authorized, user: session.user };
}
