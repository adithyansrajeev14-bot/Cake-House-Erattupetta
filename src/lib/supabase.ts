import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

// SQL Schema for manual initialization in Supabase dashboard
export const SUPABASE_SQL_SCHEMA = `-- 1. Enable UUID Extension (optional)
create extension if not exists "uuid-ossp";

-- 2. Products Table
create table if not exists public.products (
  id text primary key,
  title text not null,
  category text not null check (category in ('custom-cakes', 'brownies', 'puddings', 'hampers')),
  price numeric not null check (price >= 0),
  image_url text not null,
  description text not null,
  weight_options jsonb default '[]'::jsonb,
  available_flavors text[],
  is_eggless_available boolean default true,
  preparation_time text default '24 hours',
  rating numeric default 5.0,
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Orders Table
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  delivery_address text not null,
  landmark text,
  delivery_date text not null,
  delivery_slot text not null,
  items_json jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric default 0,
  total_amount numeric not null,
  status text not null default 'received' check (status in ('received', 'baking', 'ready', 'delivered')),
  payment_method text not null check (payment_method in ('whatsapp', 'stripe', 'cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  stripe_payment_id text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- 5. Policies
create policy "Public read access on products" 
  on public.products for select using (true);

create policy "Public insert access on orders" 
  on public.orders for insert with check (true);

create policy "Public read orders by id" 
  on public.orders for select using (true);
`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        fetch: (input, init) => fetch(input, init),
      },
    });
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
  }
}

export const supabase: SupabaseClient | null = client;

const STORAGE_KEY_PRODUCTS = 'cakehouse_products_v1';
const STORAGE_KEY_ORDERS = 'cakehouse_orders_v1';

// Seed or retrieve local cache for mock / offline / dev mode
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalOrder(order: Order): void {
  try {
    const orders = getLocalOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save order to local storage', e);
  }
}

export const dbService = {
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local dataset', err);
      }
    }
    // Return sample mock data instantly
    return getLocalProducts();
  },

  async getProductById(id: string): Promise<Product | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) {
          return data as Product;
        }
      } catch (err) {
        console.warn('Supabase query failed for product, falling back', err);
      }
    }
    const products = getLocalProducts();
    return products.find(p => p.id === id) || null;
  },

  async createOrder(order: Order): Promise<{ success: boolean; orderId: string; error?: string }> {
    if (supabase) {
      try {
        const { error } = await supabase.from('orders').insert([
          {
            id: order.id,
            customer_name: order.customer_name,
            phone: order.phone,
            delivery_address: order.delivery_address,
            landmark: order.landmark || '',
            delivery_date: order.delivery_date,
            delivery_slot: order.delivery_slot,
            items_json: order.items_json,
            subtotal: order.subtotal,
            delivery_fee: order.delivery_fee,
            total_amount: order.total_amount,
            status: order.status,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            stripe_payment_id: order.stripe_payment_id || null,
            notes: order.notes || '',
            created_at: order.created_at,
          }
        ]);
        if (error) {
          console.warn('Supabase order insert error, using local fallback:', error);
          saveLocalOrder(order);
          return { success: true, orderId: order.id };
        }
      } catch (err: any) {
        console.warn('Supabase order insert exception, falling back:', err);
        saveLocalOrder(order);
        return { success: true, orderId: order.id };
      }
    }

    saveLocalOrder(order);
    return { success: true, orderId: order.id };
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!error && data) {
          return data as Order;
        }
      } catch (err) {
        console.warn('Supabase fetch order failed, checking local', err);
      }
    }
    const orders = getLocalOrders();
    return orders.find(o => o.id === id) || null;
  },

  async getRecentOrders(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data) {
          return data as Order[];
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed', err);
      }
    }
    return getLocalOrders();
  }
};
