'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', price: '', description: '', stock: '', category: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function generateDescription() {
    if (!form.name.trim()) return alert('상품명을 먼저 입력하세요')
    setGeneratingDesc(true)
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, category: form.category }),
      })
      const data = await res.json()
      setForm(f => ({ ...f, description: data.description }))
    } finally {
      setGeneratingDesc(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let image_url = ''

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const { data } = await supabase.storage.from('products').upload(fileName, imageFile)
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
          image_url = publicUrl
        }
      }

      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseInt(form.price),
          description: form.description,
          stock: parseInt(form.stock) || 0,
          category: form.category,
          image_url,
        }),
      })

      router.push('/admin/products')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">상품 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이미지 업로드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">상품 이미지</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
              {imagePreview
                ? <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
              }
            </div>
            <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600">
              이미지 선택
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
            <input
              required
              type="text"
              placeholder="예: 핸드메이드 가죽 지갑"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원) *</label>
              <input
                required
                type="number"
                placeholder="29000"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
              <input
                type="number"
                placeholder="10"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <input
              type="text"
              placeholder="예: 가방, 의류, 식품..."
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">상품 설명</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
              >
                {generatingDesc ? '⏳ AI 작성 중...' : '✨ AI로 설명 생성'}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="상품 설명을 입력하거나 AI로 자동 생성하세요"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '상품 등록'}
        </button>
      </form>
    </div>
  )
}
