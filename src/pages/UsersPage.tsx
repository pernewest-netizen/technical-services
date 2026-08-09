import React, { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { UserWithRole, Role } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, Button, Badge, EmptyState, Skeleton, Dialog, Input } from '@/components/ui';
import { Users, Shield, Plus, Edit, UserCheck, UserX } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [formData, setFormData] = useState({ username: '', display_name: '', password: '', role_id: 1 });
  const { addToast } = useUIStore();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usrs, rls] = await Promise.all([authApi.getAllUsers(), authApi.getRoles()]);
      setUsers(usrs);
      setRoles(rls);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل التحميل', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      designer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      production: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[roleName] || colors.viewer;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">المستخدمون والصلاحيات</h1><p className="text-muted-foreground">إدارة المستخدمين وأدوارهم</p></div>
        <Button onClick={() => { setEditingUser(null); setFormData({ username: '', display_name: '', password: '', role_id: 1 }); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> مستخدم جديد
        </Button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : users.length > 0 ? (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 font-medium">المستخدم</th>
                <th className="text-right px-4 py-3 font-medium">الدور</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">آخر دخول</th>
                <th className="text-right px-4 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{(u.display_name || u.username).charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{u.display_name || u.username}</p>
                        <p className="text-xs text-muted-foreground font-mono">{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRoleBadge(u.role_name))}>{u.role_display_name}</span></td>
                  <td className="px-4 py-3">{u.is_active ? <Badge variant="success" className="text-xs"><UserCheck className="w-3 h-3 ml-1" />نشط</Badge> : <Badge variant="destructive" className="text-xs"><UserX className="w-3 h-3 ml-1" />معطل</Badge>}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.last_login ? formatDate(u.last_login) : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditingUser(u); setFormData({ username: u.username, display_name: u.display_name || '', password: '', role_id: u.role_id }); setIsDialogOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Edit className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="لا يوجد مستخدمون" description="لم يتم إضافة مستخدمين" />}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingUser ? 'تعديل مستخدم' : 'مستخدم جديد'}>
        <form onSubmit={(e) => { e.preventDefault(); setIsDialogOpen(false); }} className="space-y-4">
          {!editingUser && <div><label className="block text-sm font-medium mb-1.5">اسم المستخدم</label><Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>}
          <div><label className="block text-sm font-medium mb-1.5">الاسم المعروض</label><Input value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1.5">الدور</label>
            <select value={formData.role_id} onChange={e => setFormData({...formData, role_id: parseInt(e.target.value)})} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {roles.map(r => <option key={r.id} value={r.id}>{r.display_name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">{editingUser ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}</label><Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} {...(!editingUser && { required: true })} /></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button><Button type="submit">{editingUser ? 'حفظ' : 'إضافة'}</Button></div>
        </form>
      </Dialog>
    </div>
  );
};

function cn(...inputs: (string | undefined | null | false)[]) { return inputs.filter(Boolean).join(' '); }
