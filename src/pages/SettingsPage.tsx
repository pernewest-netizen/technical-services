import React, { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import { Setting } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { Settings, Palette, Database, Folder, Image, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const { addToast, theme, setTheme } = useUIStore();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try { setLoading(true); const data = await settingsApi.getAll(); setSettings(data); }
    catch (err: any) { addToast({ type: 'error', title: 'فشل التحميل', message: err.message }); }
    finally { setLoading(false); }
  };

  const handleSave = async (key: string) => {
    try {
      await settingsApi.update(key, edited[key]);
      addToast({ type: 'success', title: 'تم الحفظ' });
      setEdited(prev => { const n = { ...prev }; delete n[key]; return n; });
      loadSettings();
    } catch (err: any) { addToast({ type: 'error', title: 'فشل الحفظ', message: err.message }); }
  };

  const groups = [
    { name: 'general', label: 'عام', icon: Settings },
    { name: 'ui', label: 'الواجهة', icon: Palette },
    { name: 'storage', label: 'التخزين', icon: Database },
    { name: 'backup', label: 'النسخ الاحتياطي', icon: Folder },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">الإعدادات</h1><p className="text-muted-foreground">إعدادات النظام والتفضيلات</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {groups.map(group => {
            const groupSettings = settings.filter(s => s.group_name === group.name);
            if (groupSettings.length === 0) return null;
            return (
              <Card key={group.name}>
                <CardHeader><CardTitle className="flex items-center gap-2"><group.icon className="w-5 h-5" />{group.label}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {groupSettings.map(s => (
                    <div key={s.key} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium">{s.key.replace(/_/g, ' ')}</label>
                        {s.key === 'theme' ? (
                          <select
                            value={edited[s.key] ?? s.value ?? theme}
                            onChange={e => { setEdited({ ...edited, [s.key]: e.target.value }); setTheme(e.target.value as any); }}
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm mt-1"
                          >
                            <option value="dark">وضع الليل</option>
                            <option value="light">وضع النهار</option>
                          </select>
                        ) : s.key === 'language' ? (
                          <select
                            value={edited[s.key] ?? s.value ?? 'ar'}
                            onChange={e => setEdited({ ...edited, [s.key]: e.target.value })}
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm mt-1"
                          >
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                          </select>
                        ) : (
                          <Input
                            value={edited[s.key] ?? s.value ?? ''}
                            onChange={e => setEdited({ ...edited, [s.key]: e.target.value })}
                            className="mt-1"
                          />
                        )}
                      </div>
                      {(edited[s.key] !== undefined) && (
                        <Button size="sm" onClick={() => handleSave(s.key)} className="mt-5">
                          <Save className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Image className="w-5 h-5" />معلومات النظام</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">الإصدار</span><span>1.0.0</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">المنصة</span><span>Windows Desktop</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">قاعدة البيانات</span><span>SQLite</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الوضع</span><span>{theme === 'dark' ? 'ليلي' : 'نهاري'}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
