import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateApi } from '@/lib/api';
import { Template } from '@/types';
import { useAuthStore, useUIStore } from '@/stores';
import { Card, CardContent, Button, EmptyState, GridSkeleton } from '@/components/ui';
import { Star, Palette, Heart } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => { if (user) loadFavorites(); }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await templateApi.getAll({ isFavorite: true, limit: 100 });
      setTemplates(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل التحميل', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (template: Template) => {
    try {
      await templateApi.toggleFavorite(template.id);
      addToast({ type: 'success', title: 'تمت الإزالة من المفضلة' });
      loadFavorites();
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشلت العملية', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">المفضلة</h1>
          <p className="text-muted-foreground">التصميمات المفضلة</p>
        </div>
      </div>
      {loading ? <GridSkeleton count={8} /> : templates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {templates.map(t => (
            <Card key={t.id} className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden" onClick={() => navigate(`/templates/${t.id}`)}>
              <div className="aspect-square bg-muted relative overflow-hidden">
                {t.thumbnail_path ? (
                  <img src={t.thumbnail_path} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Palette className="w-10 h-10 text-muted-foreground/30" /></div>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleRemove(t); }} className="absolute top-2 left-2 p-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm truncate">{t.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono">{t.code}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد مفضلات"
          description="أضف تصميمات للمفضلة بالضغط على ⭐"
          action={<Button onClick={() => navigate('/templates')}>تصفح التصميمات</Button>}
        />
      )}
    </div>
  );
};
