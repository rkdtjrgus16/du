-- Supabase SQL Editor에서 이 파일 내용을 붙여넣고 실행하세요

-- 상품 테이블
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 상품 테이블
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);

-- 누구나 상품 조회 가능
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "누구나 상품 조회" ON products FOR SELECT USING (true);
CREATE POLICY "서비스롤 전체 권한" ON products USING (true);

-- 누구나 주문 가능
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "누구나 주문 생성" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "서비스롤 주문 전체 권한" ON orders USING (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "누구나 주문상품 생성" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "서비스롤 주문상품 전체 권한" ON order_items USING (true);

-- Supabase Storage 버킷 생성 (SQL Editor에서 실행)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "누구나 이미지 업로드" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "누구나 이미지 조회" ON storage.objects
FOR SELECT USING (bucket_id = 'products');
