import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { demoProducts } from '@/lib/demo-products'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.startsWith('sk-...')) {
    return NextResponse.json(
      { error: 'OpenAI API 키가 설정되지 않았어요. .env.local 파일에 OPENAI_API_KEY를 입력해주세요.' },
      { status: 500 }
    )
  }

  const openai = new OpenAI({ apiKey })
  const { messages } = await req.json()

  // 상품 목록 (Supabase 연결 시 DB에서, 아니면 데모 상품 사용)
  let productList = ''
  try {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, description, category, stock')
      .gt('stock', 0)
    const products = data && data.length > 0 ? data : demoProducts
    productList = products
      .map(p => `- ${p.name} (${p.price.toLocaleString()}원) [${p.category ?? '기타'}]: ${p.description ?? ''}`)
      .join('\n')
  } catch {
    productList = demoProducts
      .map(p => `- ${p.name} (${p.price.toLocaleString()}원) [${p.category ?? '기타'}]: ${p.description ?? ''}`)
      .join('\n')
  }

  const systemPrompt = `당신은 쇼핑몰의 친절한 AI 쇼핑 도우미입니다. ChatGPT 기반으로 작동합니다.
현재 판매 중인 상품 목록:
${productList}

고객의 질문에 따라 적절한 상품을 추천해주세요. 한국어로 친절하고 자연스럽게 답변하세요.
상품을 추천할 때는 상품명과 가격을 명확히 알려주세요.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 500,
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
