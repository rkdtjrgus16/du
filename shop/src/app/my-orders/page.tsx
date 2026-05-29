'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getLocalUser } from '@/lib/local-auth'

interface Order {
  id: string
  total_price: number
  status: string
  created_at: string
  items: string[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: '주문접수',
  confirmed: '확인완료',
  shipped: '배송중',
  delivered: '배송완료',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getLocalUser()
    if (!user) { router.push('/login'); return }

    try {
      const stored = localStorage.getItem(`orders_${user.email}`)
      setOrders(stored ? JSON.parse(stored) : [])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }, [router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">내 주문 내역</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-4">아직 주문 내역이 없어요</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ko-KR')}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items?.map((item, i) => (
                  <p key={i} className="text-sm text-gray-700">{item}</p>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <p className="text-sm text-gray-500">총 결제금액</p>
                <p className="font-bold text-blue-600">{order.total_price.toLocaleString()}원</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
