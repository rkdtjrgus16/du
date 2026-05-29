import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  // 모든 상품 가져오기
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .gt('stock', 0)

  if (!products || products.length === 0) {
    return NextResponse.json({ products: [] })
  }

  // GPT로 관련 상품 찾기 (pgvector 없이도 동작)
  const productList = products.map((p, i) => `${i}: ${p.name} (${p.category ?? ''}) - ${p.description ?? ''}`).join('\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `다음 상품 목록에서 검색어와 가장 관련 있는 상품의 인덱스 번호를 JSON 배열로 반환하세요. 예: {"indices": [0, 2, 3]}. 최대 8개.\n\n상품 목록:\n${productList}`,
      },
      { role: 'user', content: `검색어: ${query}` },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 100,
  })

  try {
    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    const indices: number[] = result.indices ?? []
    const found = indices.map(i => products[i]).filter(Boolean)
    return NextResponse.json({ products: found.length > 0 ? found : products })
  } catch {
    return NextResponse.json({ products })
  }
}
