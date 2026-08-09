import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { MainLayout } from '@/components/layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SeasonsPage } from '@/pages/SeasonsPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { TemplateDetailPage } from '@/pages/TemplateDetailPage';
import { MachinesPage } from '@/pages/MachinesPage';
import { MaterialsPage } from '@/pages/MaterialsPage';
import { ProductionGuidesPage } from '@/pages/ProductionGuidesPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { UsersPage } from '@/pages/UsersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BackupPage } from '@/pages/BackupPage';
import { FileManagerPage } from '@/pages/FileManagerPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    checkAuth();
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/seasons" element={<SeasonsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:id" element={<TemplateDetailPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/machines" element={<MachinesPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/production-guides" element={<ProductionGuidesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/files" element={<FileManagerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
