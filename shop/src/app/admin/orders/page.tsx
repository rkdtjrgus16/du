'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface OrderWithItems {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_price: number
  status: string
  created_at: string
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

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/')
        return
      }
      supabase.from('orders').select('*').order('created_at', { ascending: false })
        .then(({ data }) => setOrders(data ?? []))
    })
  }, [router])

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">주문 관리</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">아직 주문이 없어요</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.customer_phone}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.customer_address}</p>
                  <p className="text-blue-600 font-bold mt-2">{order.total_price.toLocaleString()}원</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('ko-KR')}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
