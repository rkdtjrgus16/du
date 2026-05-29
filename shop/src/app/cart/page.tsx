'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/types'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setCart(JSON.parse(stored))
  }, [])

  function updateQty(productId: string, delta: number) {
    setCart(prev => {
      const next = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }

  function removeItem(productId: string) {
    setCart(prev => {
      const next = prev.filter(i => i.product.id !== productId)
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cart, total }),
      })
      const data = await res.json()
      if (data.orderId) {
        localStorage.removeItem('cart')
        router.push(`/order-complete?id=${data.orderId}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <p className="text-xl text-gray-500 mb-6">장바구니가 비어있어요</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700">
          쇼핑하러 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">장바구니</h1>
      </div>

      {/* 상품 목록 */}
      <div className="space-y-3 mb-8">
        {cart.map(item => (
          <div key={item.product.id} className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
              {item.product.image_url
                ? <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.product.name}</p>
              <p className="text-blue-600 font-bold">{item.product.price.toLocaleString()}원</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-7 border rounded-lg text-gray-500 hover:bg-gray-50 text-sm font-bold">−</button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-7 border rounded-lg text-gray-500 hover:bg-gray-50 text-sm font-bold">+</button>
            </div>
            <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red-400 ml-2">✕</button>
          </div>
        ))}
      </div>

      {/* 주문 폼 */}
      <form onSubmit={handleOrder} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-4">배송 정보</h2>
        <div className="space-y-3">
          <input
            type="text"
            required
            placeholder="이름"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            required
            placeholder="연락처 (010-0000-0000)"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            required
            placeholder="배송 주소"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="border-t mt-4 pt-4 flex justify-between items-center mb-4">
          <span className="text-gray-600">총 금액</span>
          <span className="text-2xl font-bold text-blue-600">{total.toLocaleString()}원</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '주문 처리 중...' : '주문하기'}
        </button>
      </form>
    </div>
  )
}
