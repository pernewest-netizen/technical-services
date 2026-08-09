import React, { useEffect, useState } from 'react';
import { serviceApi, categoryApi } from '@/lib/api';
import { Service, Category } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, Button, Badge, EmptyState, GridSkeleton, Dialog, Input } from '@/components/ui';
import { Printer, Plus, Edit, Trash2, Search } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', display_name: '', description: '', category_id: null as number | null });
  const { addToast, showConfirm } = useUIStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [svcs, cats] = await Promise.all([serviceApi.getAll(), categoryApi.getAll()]);
      setServices(svcs);
      setCategories(cats);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل التحميل', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.display_name.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceApi.update(editingService.id, formData.display_name, formData.description || null, formData.category_id);
        addToast({ type: 'success', title: 'تم التحديث' });
      } else {
        await serviceApi.create(formData.name, formData.display_name, formData.description || null, formData.category_id);
        addToast({ type: 'success', title: 'تم الإضافة' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل الحفظ', message: err.message });
    }
  };

  const handleDelete = (service: Service) => {
    showConfirm({
      title: 'حذف الخدمة',
      message: `هل أنت متأكد من حذف "${service.display_name}"؟`,
      variant: 'danger',
      onConfirm: async () => {
        try { await serviceApi.delete(service.id); addToast({ type: 'success', title: 'تم الحذف' }); loadData(); }
        catch (err: any) { addToast({ type: 'error', title: 'فشل الحذف', message: err.message }); }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الخدمات</h1>
          <p className="text-muted-foreground">إدارة الخدمات المتاحة</p>
        </div>
        <Button onClick={() => { setEditingService(null); setFormData({ name: '', display_name: '', description: '', category_id: null }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> إضافة خدمة
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="البحث..." className="pr-10" />
      </div>
      {loading ? <GridSkeleton count={8} /> : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(s => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Printer className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingService(s); setFormData({ name: s.name, display_name: s.display_name, description: s.description || '', category_id: s.category_id }); setIsDialogOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-bold mt-3">{s.display_name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{s.name}</p>
                {s.category_name && <Badge variant="secondary" className="mt-2 text-xs">{s.category_name}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="لا توجد خدمات" description="لم يتم إضافة خدمات بعد" />}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingService ? 'تعديل خدمة' : 'إضافة خدمة'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingService && <div><label className="block text-sm font-medium mb-1.5">الاسم (إنجليزي)</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>}
          <div><label className="block text-sm font-medium mb-1.5">الاسم المعروض</label><Input value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1.5">القسم</label>
            <select value={formData.category_id || ''} onChange={e => setFormData({...formData, category_id: e.target.value ? parseInt(e.target.value) : null})} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">بدون قسم</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">الوصف</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" /></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button><Button type="submit">{editingService ? 'حفظ' : 'إضافة'}</Button></div>
        </form>
      </Dialog>
    </div>
  );
};
