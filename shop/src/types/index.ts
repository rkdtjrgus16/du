export interface Product {
  id: string
  name: string
  price: number
  description: string | null
  image_url: string | null
  stock: number
  category: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_price: number
  status: string
  created_at: string
}
