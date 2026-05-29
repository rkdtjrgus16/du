'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getLocalUser } from '@/lib/local-auth'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    // 관리자로 로그인된 경우 자동 인증
    const user = getLocalUser()
    if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      sessionStorage.setItem('admin_authed', '1')
    }
    if (sessionStorage.getItem('admin_authed')) setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, total_price', { count: 'exact' }),
    ]).then(([products, orders]) => {
      const revenue = (orders.data ?? []).reduce((s, o) => s + o.total_price, 0)
      setStats({ products: products.count ?? 0, orders: orders.count ?? 0, revenue })
    })
  }, [authed])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      sessionStorage.setItem('admin_authed', '1')
      setAuthed(true)
    } else {
      setError('이메일 또는 비밀번호가 틀렸어요')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm w-80">
          <div className="text-center mb-6">
            <p className="text-2xl mb-1">⚙️</p>
            <h1 className="text-xl font-bold">관리자 로그인</h1>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 mt-4">
            로그인
          </button>
          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3">
            쇼핑몰로 돌아가기
          </Link>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="flex gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 border rounded-lg">
            쇼핑몰 보기 →
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false) }}
            className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.products}</p>
          <p className="text-sm text-gray-500 mt-1">등록 상품</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{stats.orders}</p>
          <p className="text-sm text-gray-500 mt-1">총 주문</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">총 매출 (원)</p>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/products" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-2xl mb-2">📦</p>
          <p className="font-bold">상품 관리</p>
          <p className="text-sm text-gray-400 mt-1">상품 추가, 수정, 삭제</p>
        </Link>
        <Link href="/admin/orders" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-2xl mb-2">📋</p>
          <p className="font-bold">주문 관리</p>
          <p className="text-sm text-gray-400 mt-1">주문 현황 확인</p>
        </Link>
      </div>
    </div>
  )
}
