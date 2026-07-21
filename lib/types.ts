export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  bio?: string;
  role: 'buyer' | 'seller' | 'admin';
  stripe_connect_id?: string;
  telegram_id?: string;
  github?: string;
  created_at: string;
  verified?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  parent_id?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller?: User;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category?: Category;
  price: number;
  currency: string;
  file_url: string;
  preview_url?: string;
  tags: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  sales_count: number;
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at?: string;
  license: string;
  version: string;
  file_size: string;
  demo_url?: string;
  preview_images?: string[];
  file_tree?: FileTreeItem[];
  readme?: string;
}

export interface FileTreeItem {
  name: string;
  type: 'file' | 'dir';
  size?: string;
  children?: FileTreeItem[];
}

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  product?: Product;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'PAYMENT_RECEIVED';
  created_at: string;
  telegram_payment_msg_id?: string;
  license_key?: string | null;
  download_count: number;
  download_token?: string;
  download_expires?: string;
  paymentProof?: string;
  paymentConfirmedBy?: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  buyer?: User;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface PurchaseToken {
  id: string;
  product_id: string;
  price: number;
  expires_at: string;
  used: boolean;
}

export type SortOption = 'newest' | 'bestselling' | 'highest-rated' | 'price-low' | 'price-high' | 'relevance';

export type FilterState = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  licenses: string[];
  search: string;
  sort: SortOption;
};