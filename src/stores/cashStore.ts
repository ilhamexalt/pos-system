import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Cash } from '../types';


interface CashState {
  cash: Cash[];
  loading: boolean;
  fetchCash: () => Promise<void>;
}

export const useCashStore = create<CashState>((set) => ({
  cash: [],
  loading: false,
  fetchCash: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('cash')
      .select('*')
      .limit(1)
      .single(); 

    if (!error && data) {
      set({ cash: [data], loading: false }); 
    } else {
      console.error(error);
      set({ loading: false });
    }
  },
}));
