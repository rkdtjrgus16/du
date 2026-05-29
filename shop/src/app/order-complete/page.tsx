import Link from 'next/link'

export default function OrderCompletePage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">🎉</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">주문 완료!</h1>
      <p className="text-gray-500 mb-8">주문이 접수되었어요. 빠르게 배송해드릴게요.</p>
      <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700">
        계속 쇼핑하기
      </Link>
    </div>
  )
}
