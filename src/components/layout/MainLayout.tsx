import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '@/components/ui';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background text-foreground font-arabic" dir="rtl">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'mr-16' : 'mr-64'
        )}
      >
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
