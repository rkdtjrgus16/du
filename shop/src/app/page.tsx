'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { demoProducts } from '@/lib/demo-products'
import ChatBot from '@/components/ChatBot'
import CartButton from '@/components/CartButton'
import AuthButton from '@/components/AuthButton'
import { getLocalUser } from '@/lib/local-auth'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [aiSearching, setAiSearching] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchProducts()
    const user = getLocalUser()
    setIsAdmin(!!ADMIN_EMAIL && user?.email === ADMIN_EMAIL)
    const handler = () => {
      const u = getLocalUser()
      setIsAdmin(!!ADMIN_EMAIL && u?.email === ADMIN_EMAIL)
    }
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [])

  async function fetchProducts(query = '') {
    setLoading(true)
    try {
      let q = supabase.from('products').select('*').order('created_at', { ascending: false })
      if (query) q = q.ilike('name', `%${query}%`)
      const { data, error } = await q
      if (error || !data || data.length === 0) {
        // Supabase 미연결 시 데모 상품 표시
        const filtered = query
          ? demoProducts.filter(p => p.name.includes(query) || (p.category ?? '').includes(query))
          : demoProducts
        setProducts(filtered)
      } else {
        setProducts(data)
      }
    } catch {
      setProducts(demoProducts)
    }
    setLoading(false)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return fetchProducts()
    setAiSearching(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: search }),
      })
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch {
      fetchProducts(search)
    } finally {
      setAiSearching(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🛍️ 내 쇼핑몰</h1>
        <div className="flex gap-3 items-center">
          <CartButton />
          {isAdmin && (
            <Link href="/admin" className="text-sm bg-gray-900 text-white px-3 py-2 rounded-xl hover:bg-gray-700 font-medium">
              ⚙️ 관리자
            </Link>
          )}
          <AuthButton />
        </div>
      </div>

      {/* AI 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="AI 검색: '따뜻한 겨울 선물' 같이 자연어로 검색해보세요"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={aiSearching}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {aiSearching ? '검색 중...' : '🔍 검색'}
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); fetchProducts() }}
            className="px-4 py-3 border rounded-xl text-sm text-gray-500 hover:bg-gray-50"
          >
            전체
          </button>
        )}
      </form>

      {/* 상품 목록 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">상품이 없어요</p>
          <Link href="/admin/products/new" className="text-blue-600 hover:underline text-sm">
            첫 상품 등록하기 →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 group">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-700 font-bold text-xs px-3 py-1 rounded-full">품절</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      마감임박
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {product.category && (
                    <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                  )}
                  <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</p>
                  <p className="font-bold text-gray-900 mt-1.5 text-base">
                    {product.price.toLocaleString()}<span className="text-sm font-normal text-gray-500">원</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* AI 챗봇 */}
      <ChatBot products={products} />
    </div>
  )
}
