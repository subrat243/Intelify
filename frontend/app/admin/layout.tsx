'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiClient.loadToken()

        apiClient.getCurrentUser()
            .then((user) => {
                if (user.role !== 'super_admin' && user.role !== 'analyst') {
                    router.push('/dashboard')
                }
                setLoading(false)
            })
            .catch(() => router.push('/login'))
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return <>{children}</>
}
