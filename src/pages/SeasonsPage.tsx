import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seasonApi } from '@/lib/api';
import { Season } from '@/types';
import { useUIStore } from '@/stores';
import {
  Card, CardContent, Button, Badge, EmptyState, GridSkeleton,
  Dialog, Input
} from '@/components/ui';
import { Calendar, Plus, Archive, Edit, Trash2, Package, Palette } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const SeasonsPage: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
  });
  const { addToast, showConfirm } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadSeasons();
  }, [showArchived]);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const data = await seasonApi.getAll(showArchived);
      setSeasons(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل تحميل المناسبات', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeason) {
        await seasonApi.update(editingSeason.id, {
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description || null,
        });
        addToast({ type: 'success', title: 'تم تحديث المناسبة' });
      } else {
        await seasonApi.create({
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description || null,
        });
        addToast({ type: 'success', title: 'تم إضافة المناسبة' });
      }
      setIsDialogOpen(false);
      setEditingSeason(null);
      setFormData({ name: '', display_name: '', description: '' });
      loadSeasons();
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل الحفظ', message: err.message });
    }
  };

  const handleArchive = (season: Season) => {
    showConfirm({
      title: season.is_archived ? 'إلغاء الأرشفة' : 'أرشفة المناسبة',
      message: `هل أنت متأكد من ${season.is_archived ? 'إلغاء أرشفة' : 'أرشفة'} "${season.display_name}"؟`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await seasonApi.archive(season.id, !season.is_archived);
          addToast({ type: 'success', title: season.is_archived ? 'تم إلغاء الأرشفة' : 'تم الأرشفة' });
          loadSeasons();
        } catch (err: any) {
          addToast({ type: 'error', title: 'فشلت العملية', message: err.message });
        }
      },
    });
  };

  const handleDelete = (season: Season) => {
    showConfirm({
      title: 'حذف المناسبة',
      message: `هل أنت متأكد من حذف "${season.display_name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await seasonApi.delete(season.id);
          addToast({ type: 'success', title: 'تم الحذف' });
          loadSeasons();
        } catch (err: any) {
          addToast({ type: 'error', title: 'فشل الحذف', message: err.message });
        }
      },
    });
  };

  const openEdit = (season: Season) => {
    setEditingSeason(season);
    setFormData({
      name: season.name,
      display_name: season.display_name,
      description: season.description || '',
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingSeason(null);
    setFormData({ name: '', display_name: '', description: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المواسم والمناسبات</h1>
          <p className="text-muted-foreground">إدارة المواسم والمناسبات المرتبطة بالمنتجات</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'إخفاء المؤرشف' : 'عرض المؤرشف'}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة مناسبة
          </Button>
        </div>
      </div>

      {/* Seasons Grid */}
      {loading ? (
        <GridSkeleton count={8} />
      ) : seasons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {seasons.map((season) => (
            <Card
              key={season.id}
              className={cn(
                'group cursor-pointer hover:shadow-lg transition-all overflow-hidden',
                season.is_archived && 'opacity-60'
              )}
              onClick={() => navigate(`/seasons/${season.id}`)}
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-400/20 to-orange-500/20 relative overflow-hidden">
                {season.image_path ? (
                  <img src={season.image_path} alt={season.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-amber-500/50" />
                  </div>
                )}
                {season.is_archived && (
                  <Badge variant="destructive" className="absolute top-3 left-3">
                    مؤرشف
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-lg">{season.display_name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{season.description}</p>

                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    <Package className="w-3 h-3 ml-1" />
                    {season.product_count || 0}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Palette className="w-3 h-3 ml-1" />
                    {season.template_count || 0}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(season); }}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleArchive(season); }}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(season); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد مناسبات"
          description={showArchived ? 'لا توجد مناسبات مؤرشفة' : 'لم يتم إضافة أي مناسبات بعد'}
          action={<Button onClick={openCreate}>إضافة مناسبة</Button>}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingSeason ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">الاسم (بالإنجليزية)</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: ramadan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">الاسم المعروض</label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="مثال: رمضان"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف المناسبة..."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              {editingSeason ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
