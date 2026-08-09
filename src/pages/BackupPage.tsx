import React, { useEffect, useState } from 'react';
import { backupApi } from '@/lib/api';
import { BackupInfo } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, EmptyState, Skeleton } from '@/components/ui';
import { Database, Download, RotateCcw, Trash2, Calendar, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

export const BackupPage: React.FC = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const { addToast, showConfirm } = useUIStore();

  useEffect(() => { loadBackups(); }, []);

  const loadBackups = async () => {
    try { setLoading(true); const data = await backupApi.getAll(); setBackups(data); }
    catch (err: any) { addToast({ type: 'error', title: 'فشل التحميل', message: err.message }); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      const path = await backupApi.create(false);
      addToast({ type: 'success', title: 'تم إنشاء النسخة الاحتياطية', message: path });
      loadBackups();
    } catch (err: any) { addToast({ type: 'error', title: 'فشل الإنشاء', message: err.message }); }
    finally { setCreating(false); }
  };

  const handleRestore = (backup: BackupInfo) => {
    showConfirm({
      title: 'استعادة النسخة الاحتياطية',
      message: `هل أنت متأكد من استعادة "${backup.filename}"؟ سيتم استبدال قاعدة البيانات الحالية.`,
      variant: 'warning',
      confirmText: 'استعادة',
      onConfirm: async () => {
        try {
          setRestoring(backup.filename);
          await backupApi.restore(backup.path);
          addToast({ type: 'success', title: 'تمت الاستعادة', message: 'سيتم إعادة تشغيل البرنامج' });
          setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) { addToast({ type: 'error', title: 'فشلت الاستعادة', message: err.message }); }
        finally { setRestoring(null); }
      }
    });
  };

  const handleDelete = (backup: BackupInfo) => {
    showConfirm({
      title: 'حذف النسخة',
      message: `حذف "${backup.filename}"؟`,
      variant: 'danger',
      onConfirm: async () => {
        try { await backupApi.delete(backup.path); addToast({ type: 'success', title: 'تم الحذف' }); loadBackups(); }
        catch (err: any) { addToast({ type: 'error', title: 'فشل الحذف', message: err.message }); }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">النسخ الاحتياطي</h1>
            <p className="text-muted-foreground">إدارة النسخ الاحتياطية واستعادة البيانات</p>
          </div>
        </div>
        <Button onClick={handleCreate} isLoading={creating}>
          <Download className="w-4 h-4 ml-2" /> نسخة احتياطية جديدة
        </Button>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">تنبيه مهم</h3>
            <p className="text-sm text-muted-foreground mt-1">
              النسخ الاحتياطي يشمل قاعدة البيانات فقط. تأكد من نسخ مجلد الملفات (Templates, Assets, etc.) بشكل منفصل.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">{Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : backups.length > 0 ? (
        <div className="space-y-3">
          {backups.map(b => (
            <Card key={b.filename} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{b.filename}</h3>
                    {b.is_auto && <Badge variant="secondary" className="text-[10px]">تلقائي</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(b.created_at)}</span>
                    <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatFileSize(Math.round(b.size_mb * 1024 * 1024))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleRestore(b)} isLoading={restoring === b.filename}>
                    <RotateCcw className="w-4 h-4 ml-1" /> استعادة
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(b)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد نسخ احتياطية"
          description="لم يتم إنشاء أي نسخة احتياطية بعد"
          action={<Button onClick={handleCreate}><Download className="w-4 h-4 ml-2" /> إنشاء نسخة</Button>}
        />
      )}
    </div>
  );
};
