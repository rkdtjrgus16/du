'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getLocalUser, localSignOut } from '@/lib/local-auth'
import type { LocalUser } from '@/lib/local-auth'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

export default function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<LocalUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setUser(getLocalUser())
    const handler = () => setUser(getLocalUser())
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [])

  function handleLogout() {
    localSignOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 border rounded-xl hover:bg-gray-50">
          로그인
        </Link>
        <Link href="/signup" className="text-sm bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700">
          회원가입
        </Link>
      </div>
    )
  }

  const isAdmin = ADMIN_EMAIL && user.email === ADMIN_EMAIL
  const displayName = user.name || user.email.split('@')[0]

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 border rounded-xl hover:bg-gray-50 text-sm"
      >
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
          {displayName[0].toUpperCase()}
        </div>
        <span className="text-gray-700 font-medium">{displayName}</span>
        <span className="text-gray-400 text-xs">{menuOpen ? '▲' : '▼'}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 w-44 z-50">
          <p className="px-4 py-2 text-xs text-gray-400 truncate">{user.email}</p>
          <hr className="my-1 border-gray-100" />
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50"
            >
              ⚙️ 관리자 페이지
            </Link>
          )}
          <Link
            href="/my-orders"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            📋 내 주문 내역
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
