import { create } from 'zustand';
import { Toast, ConfirmDialog, ViewMode, Theme } from '@/types';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Confirm Dialog
  confirmDialog: ConfirmDialog | null;
  showConfirm: (dialog: Omit<ConfirmDialog, 'isOpen'>) => void;
  hideConfirm: () => void;

  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  theme: (localStorage.getItem('ts_theme') as Theme) || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('ts_theme', theme);
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  viewMode: (localStorage.getItem('ts_view_mode') as ViewMode) || 'grid',
  setViewMode: (mode) => {
    localStorage.setItem('ts_view_mode', mode);
    set({ viewMode: mode });
  },

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    const newToast = { ...toast, id, duration: toast.duration || 4000 };
    set((s) => ({ toasts: [...s.toasts, newToast] }));
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  confirmDialog: null,
  showConfirm: (dialog) => set({ confirmDialog: { ...dialog, isOpen: true } }),
  hideConfirm: () => set({ confirmDialog: null }),

  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
