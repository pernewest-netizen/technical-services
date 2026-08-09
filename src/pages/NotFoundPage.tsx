import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<AlertTriangle className="w-12 h-12 text-amber-500" />}
        title="الصفحة غير موجودة"
        description="الصفحة التي تبحث عنها غير موجودة أو تم نقلها"
        action={
          <Button onClick={() => navigate('/')}>
            <Home className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
        }
      />
    </div>
  );
};
