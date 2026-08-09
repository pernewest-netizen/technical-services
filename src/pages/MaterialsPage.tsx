import React, { useEffect, useState } from 'react';
import { materialApi } from '@/lib/api';
import { Material } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, Button, Badge, EmptyState, GridSkeleton, Dialog, Input } from '@/components/ui';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({ name: '', display_name: '', material_type: '', thickness: '', size: '', color: '', notes: '' });
  const { addToast, showConfirm } = useUIStore();

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    try { setLoading(true); const data = await materialApi.getAll(); setMaterials(data); }
    catch (err: any) { addToast({ type: 'error', title: 'فشل التحميل', message: err.message }); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await materialApi.update(editingMaterial.id, formData.display_name, formData.material_type, formData.thickness || null, formData.size || null, formData.color || null, formData.notes || null);
        addToast({ type: 'success', title: 'تم التحديث' });
      } else {
        await materialApi.create(formData.name, formData.display_name, formData.material_type, formData.thickness || null, formData.size || null, formData.color || null, formData.notes || null);
        addToast({ type: 'success', title: 'تم الإضافة' });
      }
      setIsDialogOpen(false); loadMaterials();
    } catch (err: any) { addToast({ type: 'error', title: 'فشل الحفظ', message: err.message }); }
  };

  const handleDelete = (m: Material) => {
    showConfirm({ title: 'حذف الخامة', message: `حذف "${m.display_name}"؟`, variant: 'danger',
      onConfirm: async () => { try { await materialApi.delete(m.id); addToast({ type: 'success', title: 'تم الحذف' }); loadMaterials(); } catch (err: any) { addToast({ type: 'error', title: 'فشل', message: err.message }); } }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">الخامات</h1><p className="text-muted-foreground">إدارة الخامات والمواد</p></div>
        <Button onClick={() => { setEditingMaterial(null); setFormData({ name: '', display_name: '', material_type: '', thickness: '', size: '', color: '', notes: '' }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> إضافة خامة
        </Button>
      </div>
      {loading ? <GridSkeleton count={8} /> : materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {materials.map(m => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingMaterial(m); setFormData({ name: m.name, display_name: m.display_name, material_type: m.material_type, thickness: m.thickness || '', size: m.size || '', color: m.color || '', notes: m.notes || '' }); setIsDialogOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-bold mt-3">{m.display_name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{m.name}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.thickness && <Badge variant="outline" className="text-xs">{m.thickness}</Badge>}
                  {m.size && <Badge variant="outline" className="text-xs">{m.size}</Badge>}
                  {m.color && <Badge variant="outline" className="text-xs" style={{backgroundColor: m.color}}>{m.color}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="لا توجد خامات" description="لم يتم إضافة خامات بعد" />}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingMaterial ? 'تعديل خامة' : 'إضافة خامة'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingMaterial && <div><label className="block text-sm font-medium mb-1.5">الاسم (إنجليزي)</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>}
          <div><label className="block text-sm font-medium mb-1.5">الاسم المعروض</label><Input value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1.5">النوع</label><Input value={formData.material_type} onChange={e => setFormData({...formData, material_type: e.target.value})} placeholder="mdf, acrylic, paper..." required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">السماكة</label><Input value={formData.thickness} onChange={e => setFormData({...formData, thickness: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1.5">المقاس</label><Input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">اللون</label><Input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1.5">ملاحظات</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" /></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button><Button type="submit">{editingMaterial ? 'حفظ' : 'إضافة'}</Button></div>
        </form>
      </Dialog>
    </div>
  );
};
