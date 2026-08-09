import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/stores';
import {
  Home, Calendar, Package, Palette, Printer, Wrench, 
  FolderOpen, Star, Users, Database, Settings, ChevronRight,
  ChevronLeft, BookOpen, Layers, Hammer, Scissors
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/seasons', icon: Calendar, label: 'المواسم والمناسبات' },
  { path: '/products', icon: Package, label: 'المنتجات' },
  { path: '/templates', icon: Palette, label: 'التصميمات' },
  { path: '/services', icon: Printer, label: 'الخدمات' },
  { path: '/machines', icon: Wrench, label: 'المعدات والخامات' },
  { path: '/production-guides', icon: BookOpen, label: 'طرق التنفيذ' },
  { path: '/files', icon: FolderOpen, label: 'إدارة الملفات' },
  { path: '/favorites', icon: Star, label: 'المفضلة' },
  { path: '/users', icon: Users, label: 'المستخدمون' },
  { path: '/backup', icon: Database, label: 'النسخ الاحتياطي' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleCollapse, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 h-full bg-card border-l border-border z-40',
        'transition-all duration-300 ease-in-out flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm truncate">المعاونة الفنية</h1>
              <p className="text-[10px] text-muted-foreground truncate">Technical Services</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-accent group relative',
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
              {!sidebarCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute right-full mr-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            'hover:bg-accent text-muted-foreground hover:text-foreground w-full',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {theme === 'dark' ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm">وضع النهار</span>}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm">وضع الليل</span>}
            </>
          )}
        </button>

        {/* User */}
        {user && (
          <div className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {user.display_name?.charAt(0) || user.username.charAt(0)}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium truncate">{user.display_name || user.username}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.role_display_name}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            'hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!sidebarCollapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};
