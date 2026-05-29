'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Product, CartItem } from '@/types'
import { demoProducts } from '@/lib/demo-products'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [others, setOthers] = useState<Product[]>([])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'review'>('info')

  useEffect(() => {
    setQty(1)
    setAdded(false)

    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        const found = (!error && data) ? data : (demoProducts.find(p => p.id === id) ?? null)
        setProduct(found)
        if (found) {
          fetchRelated(found)
          fetchOthers(found)
        }
      })
  }, [id])

  async function fetchRelated(p: Product) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', p.category)
      .neq('id', p.id)
      .gt('stock', 0)
      .limit(4)

    if (!error && data && data.length > 0) {
      setRelated(data)
    } else {
      setRelated(
        demoProducts
          .filter(d => d.id !== p.id && d.category === p.category && d.stock > 0)
          .slice(0, 4)
      )
    }
  }

  async function fetchOthers(p: Product) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', p.id)
      .neq('category', p.category)
      .gt('stock', 0)
      .limit(8)

    if (!error && data && data.length > 0) {
      setOthers(data)
    } else {
      setOthers(
        demoProducts
          .filter(d => d.id !== p.id && d.category !== p.category)
          .slice(0, 8)
      )
    }
  }

  function addToCart(targetProduct = product, targetQty = qty) {
    if (!targetProduct) return
    const stored = localStorage.getItem('cart')
    const cart: CartItem[] = stored ? JSON.parse(stored) : []
    const idx = cart.findIndex(i => i.product.id === targetProduct.id)
    if (idx >= 0) cart[idx].quantity += targetQty
    else cart.push({ product: targetProduct, quantity: targetQty })
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비 */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            ←
          </button>
          <span className="text-sm font-medium text-gray-700 truncate flex-1">{product.name}</span>
          <Link href="/cart" className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg">
            🛒
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-32">

        {/* 상품 메인 영역 */}
        <div className="bg-white rounded-3xl overflow-hidden mt-4 shadow-sm">

          {/* 이미지 */}
          <div className="relative aspect-[4/3] md:aspect-[16/9] bg-gray-100">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full text-sm">품절된 상품이에요</span>
              </div>
            )}
            {product.category && (
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-600 px-3 py-1 rounded-full shadow-sm">
                {product.category}
              </span>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="p-6 md:p-8">
            <div className="md:flex md:gap-12 md:items-start">

              {/* 왼쪽: 이름, 가격, 설명 */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-500">원</span>
                </div>

                {/* 배지들 */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="text-xs bg-red-50 text-red-500 font-medium px-3 py-1 rounded-full">
                      ⚡ 재고 {product.stock}개 남았어요
                    </span>
                  )}
                  {product.stock > 5 && (
                    <span className="text-xs bg-green-50 text-green-600 font-medium px-3 py-1 rounded-full">
                      ✓ 재고 있음
                    </span>
                  )}
                  <span className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full">
                    🚚 무료배송
                  </span>
                </div>
              </div>

              {/* 오른쪽: 수량 + 버튼 (데스크탑) */}
              <div className="hidden md:block w-72 flex-shrink-0">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">수량</p>
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 border border-gray-200 bg-white rounded-xl text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
                    >−</button>
                    <span className="flex-1 text-center font-bold text-lg">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                      className="w-10 h-10 border border-gray-200 bg-white rounded-xl text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
                    >+</button>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">총 금액</span>
                      <span className="font-bold text-gray-900">{(product.price * qty).toLocaleString()}원</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { addToCart(); setAdded(true); setTimeout(() => setAdded(false), 2000) }}
                    disabled={product.stock === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-2"
                  >
                    {added ? '✅ 담겼어요!' : '장바구니 담기'}
                  </button>
                  <button
                    onClick={() => { addToCart(); router.push('/cart') }}
                    disabled={product.stock === 0}
                    className="w-full border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    바로 구매
                  </button>
                </div>
              </div>
            </div>

            {/* 탭 */}
            <div className="mt-8 border-b border-gray-100">
              <div className="flex gap-6">
                {(['info', 'review'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'info' ? '상품 정보' : '리뷰'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {activeTab === 'info' ? (
                <div>
                  {product.description ? (
                    <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                  ) : (
                    <p className="text-gray-400 text-sm">상품 설명이 없어요.</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-sm">아직 리뷰가 없어요. 첫 리뷰를 남겨보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 비슷한 상품 */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">비슷한 상품도 있어요</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map(item => (
                <Link key={item.id} href={`/products/${item.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100">
                    <div className="aspect-square bg-gray-100 relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate leading-snug">{item.name}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{item.price.toLocaleString()}원</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 다른 상품들 */}
        {others.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">다른 상품도 둘러보세요</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {others.map(item => (
                <Link key={item.id} href={`/products/${item.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100">
                    <div className="aspect-square bg-gray-100 relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                      )}
                    </div>
                    <div className="p-3">
                      {item.category && (
                        <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
                      )}
                      <p className="text-sm font-medium text-gray-900 truncate leading-snug">{item.name}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{item.price.toLocaleString()}원</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 (모바일) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-9 border border-gray-200 rounded-xl text-gray-600 font-bold"
          >−</button>
          <span className="flex-1 text-center font-bold">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
            className="w-9 h-9 border border-gray-200 rounded-xl text-gray-600 font-bold"
          >+</button>
          <span className="text-sm font-bold text-gray-700 ml-2">
            {(product.price * qty).toLocaleString()}원
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { addToCart(); setAdded(true); setTimeout(() => setAdded(false), 2000) }}
            disabled={product.stock === 0}
            className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            {added ? '✅ 담김' : '장바구니'}
          </button>
          <button
            onClick={() => { addToCart(); router.push('/cart') }}
            disabled={product.stock === 0}
            className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            바로 구매
          </button>
        </div>
      </div>
    </div>
  )
}
