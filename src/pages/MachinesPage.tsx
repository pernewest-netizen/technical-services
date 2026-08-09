import React, { useEffect, useState } from 'react';
import { machineApi } from '@/lib/api';
import { Machine } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, Button, Badge, EmptyState, GridSkeleton, Dialog, Input } from '@/components/ui';
import { Wrench, Plus, Edit, Trash2, Zap, Maximize, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const MachinesPage: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({ name: '', display_name: '', machine_type: '', brand: '', model: '', power: '', work_area: '', notes: '' });
  const { addToast, showConfirm } = useUIStore();

  useEffect(() => { loadMachines(); }, []);

  const loadMachines = async () => {
    try { setLoading(true); const data = await machineApi.getAll(); setMachines(data); }
    catch (err: any) { addToast({ type: 'error', title: 'فشل التحميل', message: err.message }); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await machineApi.update(editingMachine.id, formData.display_name, formData.machine_type, formData.brand || null, formData.model || null, formData.power || null, formData.work_area || null, formData.notes || null);
        addToast({ type: 'success', title: 'تم التحديث' });
      } else {
        await machineApi.create(formData.name, formData.display_name, formData.machine_type, formData.brand || null, formData.model || null, formData.power || null, formData.work_area || null, formData.notes || null);
        addToast({ type: 'success', title: 'تم الإضافة' });
      }
      setIsDialogOpen(false); loadMachines();
    } catch (err: any) { addToast({ type: 'error', title: 'فشل الحفظ', message: err.message }); }
  };

  const handleDelete = (m: Machine) => {
    showConfirm({ title: 'حذف الماكينة', message: `حذف "${m.display_name}"؟`, variant: 'danger',
      onConfirm: async () => { try { await machineApi.delete(m.id); addToast({ type: 'success', title: 'تم الحذف' }); loadMachines(); } catch (err: any) { addToast({ type: 'error', title: 'فشل', message: err.message }); } }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">المعدات</h1><p className="text-muted-foreground">إدارة المعدات والماكينات</p></div>
        <Button onClick={() => { setEditingMachine(null); setFormData({ name: '', display_name: '', machine_type: '', brand: '', model: '', power: '', work_area: '', notes: '' }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> إضافة ماكينة
        </Button>
      </div>
      {loading ? <GridSkeleton count={8} /> : machines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machines.map(m => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingMachine(m); setFormData({ name: m.name, display_name: m.display_name, machine_type: m.machine_type, brand: m.brand || '', model: m.model || '', power: m.power || '', work_area: m.work_area || '', notes: m.notes || '' }); setIsDialogOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-bold mt-3">{m.display_name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{m.name}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.brand && <Badge variant="outline" className="text-xs">{m.brand}</Badge>}
                  {m.model && <Badge variant="outline" className="text-xs">{m.model}</Badge>}
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {m.power && <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> {m.power}</div>}
                  {m.work_area && <div className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {m.work_area}</div>}
                  {m.last_maintenance && <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(m.last_maintenance)}</div>}
                </div>
                {m.materials.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">الخامات المدعومة:</p>
                    <div className="flex flex-wrap gap-1">
                      {m.materials.map(mat => <Badge key={mat.id} variant="secondary" className="text-[10px]">{mat.display_name}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="لا توجد ماكينات" description="لم يتم إضافة معدات بعد" />}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingMachine ? 'تعديل ماكينة' : 'إضافة ماكينة'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingMachine && <div><label className="block text-sm font-medium mb-1.5">الاسم (إنجليزي)</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>}
          <div><label className="block text-sm font-medium mb-1.5">الاسم المعروض</label><Input value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1.5">النوع</label><Input value={formData.machine_type} onChange={e => setFormData({...formData, machine_type: e.target.value})} placeholder="laser, printer, heat_press..." required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">الماركة</label><Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1.5">الموديل</label><Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">القوة</label><Input value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1.5">منطقة العمل</label><Input value={formData.work_area} onChange={e => setFormData({...formData, work_area: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">ملاحظات</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" /></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button><Button type="submit">{editingMachine ? 'حفظ' : 'إضافة'}</Button></div>
        </form>
      </Dialog>
    </div>
  );
};
