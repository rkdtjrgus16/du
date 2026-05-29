import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const { name, category } = await req.json()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '당신은 온라인 쇼핑몰의 상품 설명 작가입니다. 매력적이고 자연스러운 한국어로 상품 설명을 작성하세요. 2-4문장으로 짧고 임팩트 있게 작성하세요.',
      },
      {
        role: 'user',
        content: `상품명: ${name}${category ? `\n카테고리: ${category}` : ''}\n\n이 상품의 설명을 작성해주세요.`,
      },
    ],
    max_tokens: 200,
  })

  const description = completion.choices[0].message.content ?? ''
  return NextResponse.json({ description })
}
