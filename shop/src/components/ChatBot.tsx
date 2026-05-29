'use client'

import { useState, useRef, useEffect } from 'react'
import type { Product } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBot({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 🛍️ 원하는 상품을 찾아드릴게요. 어떤 걸 찾으시나요?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: err.error ?? '오류가 발생했어요.' }])
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let text = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: text }
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 챗봇 버튼 */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors text-2xl flex items-center justify-center z-50"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* 챗봇 창 */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-xl flex flex-col z-50 border border-gray-100">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-2xl">
            <p className="font-bold text-sm">🛍️ AI 쇼핑 도우미</p>
            <p className="text-xs text-blue-100">상품 추천 받아보세요</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content || (loading && msg.role === 'assistant' ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-gray-100">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-40"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
