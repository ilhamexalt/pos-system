import { create } from 'zustand';
import { Notification } from '../types';
import { supabase } from '../config/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  channel: RealtimeChannel | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  channel: null,

  fetchNotifications: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ notifications: data, loading: false });
    } else {
      set({ loading: false });
      if (error) console.error('Error fetching notifications:', error.message);
    }
  },

  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error.message);
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }));
  },
  markAllAsRead: async () => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false); 

  if (error) {
    console.error('Error marking notifications as read:', error.message);
    return;
  }

  set((state) => ({
    notifications: state.notifications.map((n) => ({
      ...n,
      is_read: true,
    })),
  }));
},
  subscribeToNotifications: () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          set((state) => ({
            notifications: [payload.new as Notification, ...state.notifications],
          }));
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },
}));