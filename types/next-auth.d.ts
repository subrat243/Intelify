import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        id: string
        role: 'ADMIN' | 'ANALYST' | 'VIEWER'
        image?: string | null
    }

    interface Session {
        user: {
            id: string
            email: string
            name: string | null
            role: 'ADMIN' | 'ANALYST' | 'VIEWER'
            image?: string | null
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: 'ADMIN' | 'ANALYST' | 'VIEWER'
    }
}
