import { create } from 'zustand';
import { UserWithRole, LoginRequest, LoginResponse } from '@/types';
import { invoke } from '@tauri-apps/api/tauri';

interface AuthState {
  user: UserWithRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (req: LoginRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (req) => {
    set({ isLoading: true, error: null });
    try {
      const response: LoginResponse = await invoke('login', { req });
      if (response.success && response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null
        });
        localStorage.setItem('ts_user_id', response.user.id.toString());
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.message,
          isAuthenticated: false 
        });
        return false;
      }
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err?.message || 'حدث خطأ في تسجيل الدخول',
        isAuthenticated: false 
      });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
    localStorage.removeItem('ts_user_id');
  },

  checkAuth: async () => {
    const userId = localStorage.getItem('ts_user_id');
    if (!userId) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const user: UserWithRole | null = await invoke('get_current_user', { userId: parseInt(userId) });
      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        localStorage.removeItem('ts_user_id');
        set({ isAuthenticated: false, user: null });
      }
    } catch {
      localStorage.removeItem('ts_user_id');
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
