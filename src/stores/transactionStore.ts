import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Transaction } from '../types';

const PAGE_SIZE = 10;

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  allDataLoaded: boolean;
  fetchTransactions: () => Promise<void>;
  fetchAllTransactions: () => Promise<void>;
  fetchMoreTransactions: () => Promise<void>;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  allDataLoaded: false,

  fetchTransactions: async () => {
    set({ loading: true, transactions: [], hasMore: true, allDataLoaded: false });
    const { data, error } = await supabase
      .from('transactions')
      .select('id, order_id, payment_method_id, amount, user_uid, status, category, type, description, created_at, payment_method, platform')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (!error && data) {
      set({
        transactions: data,
        loading: false,
        hasMore: data.length === PAGE_SIZE
      });
    } else {
      console.error(error);
      set({ loading: false, hasMore: false });
    }
  },

  fetchAllTransactions: async () => {
    const { allDataLoaded, transactions } = get();

    // If all data already loaded, don't fetch again
    if (allDataLoaded) return;

    set({ loading: true });
    const { data, error } = await supabase
      .from('transactions')
      .select('id, order_id, payment_method_id, amount, user_uid, status, category, type, description, created_at, payment_method, platform')
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({
        transactions: data,
        loading: false,
        hasMore: false,
        allDataLoaded: true
      });
    } else {
      console.error(error);
      set({ loading: false });
    }
  },

  fetchMoreTransactions: async () => {
    const { transactions, loadingMore, hasMore } = get();

    if (loadingMore || !hasMore) return;

    set({ loadingMore: true });

    const from = transactions.length;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('transactions')
      .select('id, order_id, payment_method_id, amount, user_uid, status, category, type, description, created_at, payment_method, platform')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      set({
        transactions: [...transactions, ...data],
        loadingMore: false,
        hasMore: data.length === PAGE_SIZE
      });
    } else {
      console.error(error);
      set({ loadingMore: false, hasMore: false });
    }
  },

  resetTransactions: () => {
    set({ transactions: [], hasMore: true, allDataLoaded: false });
  },
}));
