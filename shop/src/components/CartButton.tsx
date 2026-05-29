'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CartButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function update() {
      const stored = localStorage.getItem('cart')
      if (!stored) return setCount(0)
      const cart = JSON.parse(stored)
      setCount(cart.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0))
    }
    update()
    window.addEventListener('storage', update)
    const timer = setInterval(update, 1000)
    return () => { window.removeEventListener('storage', update); clearInterval(timer) }
  }, [])

  return (
    <Link href="/cart" className="relative flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-medium">
      🛒 장바구니
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  )
}
