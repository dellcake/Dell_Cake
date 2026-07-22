-- SQL Schema Setup for Dell Cake (Supabase Database)
-- Execute this script in your Supabase SQL Editor.

-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    type TEXT NOT NULL, -- 'cake' or 'cookie'
    cake_type TEXT,     -- 'birthday', 'kids', 'engagement', 'wedding', 'custom'
    details JSONB DEFAULT '{}'::jsonb, -- stores flavor, filling, design, colors, text, etc.
    weight NUMERIC,
    delivery_date TEXT,
    delivery_time TEXT,
    description TEXT,
    image_url TEXT,
    ip_address TEXT,
    status TEXT DEFAULT 'new' -- 'new', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'canceled'
);

-- Enable Realtime for the orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Create the push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row-Level Security (RLS) Configuration
-- To make integration seamless, we will allow anonymous inserts and updates/reads for public clients.
-- You can later restrict SELECT, UPDATE, and DELETE to authenticated admins for maximum security.

-- Enable RLS on tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for 'orders' table
CREATE POLICY "Allow public inserts on orders"
ON orders FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select on orders"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public update on orders"
ON orders FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow public delete on orders"
ON orders FOR DELETE
TO public
USING (true);

-- Policies for 'push_subscriptions' table
CREATE POLICY "Allow public inserts on push_subscriptions"
ON push_subscriptions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select on push_subscriptions"
ON push_subscriptions FOR SELECT
TO public
USING (true);
