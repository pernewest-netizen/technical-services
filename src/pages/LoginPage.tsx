import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { Button, Input } from '@/components/ui';
import { Layers, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast({ type: 'warning', title: 'يرجى ملء جميع الحقول' });
      return;
    }

    const success = await login({ username, password });
    if (success) {
      addToast({ type: 'success', title: 'تم تسجيل الدخول بنجاح' });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">المعاونة الفنية</h1>
          <p className="text-muted-foreground mt-1">Technical Services</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-muted-foreground mb-6">أدخل بيانات حسابك للوصول للنظام</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">اسم المستخدم</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="text-right"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="text-right pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>الحساب الافتراضي: admin / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
