'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/')
        return
      }
      fetchProducts()
    })
  }, [router])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('삭제할까요?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-2xl font-bold">상품 관리</h1>
        </div>
        <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          + 상품 등록
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">등록된 상품이 없어요</p>
          <Link href="/admin/products/new" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">
            첫 상품 등록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm">
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                {product.image_url
                  ? <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-gray-400">{product.price.toLocaleString()}원 · 재고 {product.stock}개</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/products/${product.id}/edit`} className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-lg">
                  수정
                </Link>
                <button onClick={() => deleteProduct(product.id)} className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
