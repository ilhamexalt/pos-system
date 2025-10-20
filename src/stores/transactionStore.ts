import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Transaction } from '../types';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ transactions: data, loading: false });
    } else {
      console.error(error);
      set({ loading: false });
    }
  },
}));
