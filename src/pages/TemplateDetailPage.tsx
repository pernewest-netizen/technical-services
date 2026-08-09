import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateApi } from '@/lib/api';
import { Template, TemplateVersion } from '@/types';
import { useUIStore } from '@/stores';
import {
  Card, CardContent, CardHeader, CardTitle, Button, Badge,
  Skeleton, EmptyState, Dialog
} from '@/components/ui';
import {
  ArrowRight, Star, Edit, FolderOpen, ExternalLink, FileImage,
  Layers, Tag, Clock, User, Maximize2, GitBranch, Plus
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

export const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const { addToast, showConfirm } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadTemplate(parseInt(id));
  }, [id]);

  const loadTemplate = async (templateId: number) => {
    try {
      setLoading(true);
      const data = await templateApi.getById(templateId);
      setTemplate(data);
      if (data) {
        const vers = await templateApi.getVersions(templateId);
        setVersions(vers);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل تحميل التصميم', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!template) return;
    try {
      await templateApi.toggleFavorite(template.id);
      addToast({
        type: 'success',
        title: template.is_favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة',
      });
      if (id) loadTemplate(parseInt(id));
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشلت العملية', message: err.message });
    }
  };

  const handleOpenFolder = async () => {
    // TODO: Implement via Tauri
    addToast({ type: 'info', title: 'جاري الفتح...' });
  };

  const handleOpenPhotoshop = async () => {
    // TODO: Implement via Tauri
    addToast({ type: 'info', title: 'جاري فتح Photoshop...' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <EmptyState
        title="التصميم غير موجود"
        description="لم يتم العثور على التصميم المطلوب"
        action={<Button onClick={() => navigate('/templates')}>العودة للتصميمات</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/templates')} className="hover:text-foreground transition-colors">
            التصميمات
          </button>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{template.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
          >
            <Star className={cn('w-4 h-4 ml-1.5', template.is_favorite && 'fill-amber-500 text-amber-500')} />
            {template.is_favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/templates/${template.id}/edit`)}>
            <Edit className="w-4 h-4 ml-1.5" />
            تعديل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[16/10] bg-muted relative overflow-hidden rounded-t-xl">
                {template.preview_path ? (
                  <img
                    src={template.preview_path}
                    alt={template.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <FileImage className="w-16 h-16 text-muted-foreground/30" />
                    <p className="text-muted-foreground mt-2">لا يوجد معاينة</p>
                  </div>
                )}
                <button className="absolute top-3 left-3 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                الملفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FileActionCard
                  icon={FileImage}
                  label="فتح Preview"
                  onClick={() => {}}
                />
                <FileActionCard
                  icon={ExternalLink}
                  label="فتح PSD"
                  onClick={handleOpenPhotoshop}
                  color="text-blue-500"
                />
                <FileActionCard
                  icon={FolderOpen}
                  label="فتح المجلد"
                  onClick={handleOpenFolder}
                />
                <FileActionCard
                  icon={Plus}
                  label="إضافة إصدار"
                  onClick={() => setShowVersions(true)}
                  color="text-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Versions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                الإصدارات
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowVersions(true)}>
                <Plus className="w-4 h-4 ml-1" />
                إصدار جديد
              </Button>
            </CardHeader>
            <CardContent>
              {versions.length > 0 ? (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border',
                        version.version_number === template.current_version
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent/50'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">v{version.version_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          الإصدار {version.version_number}
                          {version.version_number === template.current_version && (
                            <Badge variant="success" className="mr-2 text-[10px]">الحالي</Badge>
                          )}
                        </p>
                        {version.change_notes && (
                          <p className="text-xs text-muted-foreground">{version.change_notes}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(version.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="لا توجد إصدارات"
                  description="لم يتم إضافة أي إصدارات بعد"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات التصميم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="الكود" value={template.code} mono />
              <InfoRow label="الاسم" value={template.name} />
              <InfoRow label="المناسبة" value={template.season_name || '—'} />
              <InfoRow label="القسم" value={template.category_name || '—'} />
              <InfoRow label="المنتج" value={template.product_name || '—'} />
              <InfoRow label="الخامة" value={template.material_name || '—'} />
              <InfoRow label="المقاس" value={template.size || '—'} />
              <InfoRow label="الماكينة" value={template.machine_name || '—'} />
              <InfoRow
                label="قابل للتعديل"
                value={template.is_editable ? 'نعم' : 'لا'}
              />
              <InfoRow
                label="الإصدار الحالي"
                value={`v${template.current_version}`}
              />
              <div className="pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{template.created_by_name || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(template.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                الوسوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => navigate(`/templates?tag=${tag.name}`)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد وسوم</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Info Row Component
const InfoRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={cn('text-sm font-medium', mono && 'font-mono')}>{value}</span>
  </div>
);

// File Action Card
const FileActionCard: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}> = ({ icon: Icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
  >
    <Icon className={cn('w-6 h-6', color || 'text-muted-foreground')} />
    <span className="text-xs">{label}</span>
  </button>
);

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
