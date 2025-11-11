export interface Product {
  id: string;
  name: string;
  description: string | null;
  in_stock: number | null;
  category: string;
  price: number | null;
  user_uid: string | null;
  image: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  product_id: string | null;
  user_uid: string | null;
  created_at: string | null;
  status: string | null;
  total_amount: number | null;
}

export interface Transaction {
  id: string;
  order_id: string | null;
  payment_method_id: string | null;
  amount: number;
  user_uid: string | null;
  status: "pending" | "completed" | "failed";
  category: "income" | "outcome" | "selling" | "buying";
  type: "income" | "outcome";
  description: string | null;
  created_at: string | null;
  payment_method: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
  is_read: boolean | null;
}

export type RootStackParamList = {
  Login: undefined;
  ProductList: { hideTabBar?: boolean } | undefined;
  Cart: undefined;
  Checkout: undefined;
  Notifications: undefined;
  Transactions: undefined;
  Main: undefined;
  Account: undefined;
  AddTransaction: undefined;
  Products: undefined;
  CashHistory: undefined;
};

export interface Cash {
  id: string;
  nominal: number;
  updated_at: string | null;
}

// Tipe data untuk baris cash
export interface CashEntry {
  id: number;
  nominal: number;
  desc: string;
  updated_at: string;
}