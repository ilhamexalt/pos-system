import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ghdhaujpaibdrvbqhawa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZGhhdWpwYWliZHJ2YnFoYXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNTU2OTAsImV4cCI6MjA3MzgzMTY5MH0.J98HgzZsf2Kv7XSfikvsm6P09Xl8h0zIMHgXF3CRKcA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});