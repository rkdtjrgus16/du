import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  const { name, phone, address, cart, total } = await req.json()
  const db = supabaseAdmin()

  // 주문 생성
  const { data: order, error } = await db
    .from('orders')
    .insert({
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      total_price: total,
    })
    .select()
    .single()

  if (error || !order) return NextResponse.json({ error: '주문 실패' }, { status: 500 })

  // 주문 상품 저장
  const items = (cart as CartItem[]).map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price,
  }))
  await db.from('order_items').insert(items)

  // 재고 감소
  for (const item of cart as CartItem[]) {
    try {
      await db.rpc('decrement_stock', {
        product_id: item.product.id,
        amount: item.quantity,
      })
    } catch {
      // 재고 감소 실패해도 주문은 유지
    }
  }

  return NextResponse.json({ orderId: order.id })
}
