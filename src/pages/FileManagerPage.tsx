import React, { useEffect, useState } from 'react';
import { fileManagerApi } from '@/lib/api';
import { FileSystemEntry, StorageInfo } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, EmptyState, Skeleton } from '@/components/ui';
import { FolderOpen, File, HardDrive, ArrowLeft, Folder, Image, FileText, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';

const FILE_ICONS: Record<string, React.ElementType> = {
  psd: Image, ai: FileText, pdf: FileText, svg: Image,
  png: Image, jpg: Image, jpeg: Image, ttf: FileText,
  otf: FileText, zip: FileText,
};

export const FileManagerPage: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('D:\\TechnicalServices');
  const [entries, setEntries] = useState<FileSystemEntry[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast, showConfirm } = useUIStore();

  useEffect(() => { loadDirectory(currentPath); loadStorageInfo(); }, []);

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      const data = await fileManagerApi.scanDirectory(path);
      setEntries(data);
      setCurrentPath(path);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل فتح المجلد', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try { const info = await fileManagerApi.getStorageInfo(); setStorageInfo(info); }
    catch (err: any) { console.error('Storage info error:', err); }
  };

  const handleOpen = (entry: FileSystemEntry) => {
    if (entry.is_directory) {
      loadDirectory(entry.path);
    } else {
      fileManagerApi.openFolder(entry.path).catch((err: any) => {
        addToast({ type: 'error', title: 'فشل الفتح', message: err.message });
      });
    }
  };

  const handleDelete = (entry: FileSystemEntry) => {
    showConfirm({
      title: 'حذف',
      message: `حذف "${entry.name}"؟`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fileManagerApi.deleteFile(entry.path);
          addToast({ type: 'success', title: 'تم الحذف' });
          loadDirectory(currentPath);
          loadStorageInfo();
        } catch (err: any) { addToast({ type: 'error', title: 'فشل الحذف', message: err.message }); }
      }
    });
  };

  const getFileIcon = (entry: FileSystemEntry) => {
    if (entry.is_directory) return Folder;
    const ext = entry.extension?.toLowerCase() || '';
    return FILE_ICONS[ext] || File;
  };

  const getFileColor = (entry: FileSystemEntry) => {
    if (entry.is_directory) return 'text-amber-500';
    const ext = entry.extension?.toLowerCase() || '';
    if (['psd', 'ai'].includes(ext)) return 'text-blue-500';
    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) return 'text-emerald-500';
    if (['pdf'].includes(ext)) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة الملفات</h1>
            <p className="text-muted-foreground">استعراض وإدارة ملفات النظام</p>
          </div>
        </div>
      </div>

      {storageInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'الإجمالي', value: storageInfo.total_size_mb, color: 'bg-blue-500' },
            { label: 'Templates', value: storageInfo.templates_size_mb, color: 'bg-emerald-500' },
            { label: 'Previews', value: storageInfo.previews_size_mb, color: 'bg-amber-500' },
            { label: 'Mockups', value: storageInfo.mockups_size_mb, color: 'bg-pink-500' },
            { label: 'Fonts', value: storageInfo.fonts_size_mb, color: 'bg-purple-500' },
            { label: 'Assets', value: storageInfo.assets_size_mb, color: 'bg-cyan-500' },
            { label: 'Backups', value: storageInfo.backups_size_mb, color: 'bg-gray-500' },
          ].map(item => (
            <Card key={item.label} className="overflow-hidden">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold mt-1">{formatFileSize(Math.round(item.value * 1024 * 1024))}</p>
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', item.color)} style={{ width: `${Math.min((item.value / (storageInfo.total_size_mb || 1)) * 100, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const parent = currentPath.substring(0, currentPath.lastIndexOf('\\'));
              if (parent && parent !== currentPath) loadDirectory(parent);
            }} className="p-1.5 rounded-lg hover:bg-accent">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{currentPath}</code>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : entries.length > 0 ? (
            <div className="space-y-1">
              {entries.map(entry => {
                const Icon = getFileIcon(entry);
                return (
                  <div key={entry.path} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 group transition-colors">
                    <Icon className={cn('w-5 h-5 flex-shrink-0', getFileColor(entry))} />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpen(entry)}>
                      <p className="text-sm font-medium truncate">{entry.name}</p>
                      {!entry.is_directory && (
                        <p className="text-xs text-muted-foreground">
                          {entry.size !== null && formatFileSize(entry.size)} · {entry.extension?.toUpperCase()}
                        </p>
                      )}
                    </div>
                    {entry.modified_at && <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(entry.modified_at)}</span>}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => fileManagerApi.openFolder(entry.path)} className="p-1.5 rounded hover:bg-accent" title="فتح المجلد">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(entry)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="المجلد فارغ" description="لا توجد ملفات في هذا المجلد" />}
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...inputs: (string | undefined | null | false)[]) { return inputs.filter(Boolean).join(' '); }
