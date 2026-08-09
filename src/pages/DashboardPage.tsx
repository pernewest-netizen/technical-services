import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import { useUIStore } from '@/stores';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Skeleton, EmptyState
} from '@/components/ui';
import {
  Palette, Package, Calendar, FolderOpen, Clock, Database,
  TrendingUp, Star, ArrowLeft, Zap, Heart
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل تحميل البيانات', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'التصميمات',
      value: stats?.total_templates || 0,
      icon: Palette,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      path: '/templates',
    },
    {
      title: 'المنتجات',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      path: '/products',
    },
    {
      title: 'المناسبات',
      value: stats?.total_seasons || 0,
      icon: Calendar,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      path: '/seasons',
    },
    {
      title: 'الملفات',
      value: stats?.total_files || 0,
      icon: FolderOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      path: '/files',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على النظام</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Card
                key={stat.title}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(stat.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={cn('p-3 rounded-lg', stat.bg)}>
                      <stat.icon className={cn('w-6 h-6', stat.color)} />
                    </div>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Season */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              الموسم الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : stats?.current_season ? (
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{stats.current_season.display_name}</h3>
                  <p className="text-muted-foreground mt-1">{stats.current_season.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary">
                      {stats.current_season.product_count || 0} منتج
                    </Badge>
                    <Badge variant="secondary">
                      {stats.current_season.template_count || 0} تصميم
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate(`/seasons/${stats.current_season?.id}`)}
                  >
                    عرض التفاصيل
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="لا يوجد موسم حالي"
                description="لم يتم تحديد موسم نشط حالياً"
              />
            )}
          </CardContent>
        </Card>

        {/* Storage & Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              التخزين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">مساحة قاعدة البيانات</span>
                    <span className="font-medium">{formatFileSize(Math.round((stats?.storage_used_mb || 0) * 1024 * 1024))}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min((stats?.storage_used_mb || 0) / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">آخر نسخة احتياطية</span>
                    <span className="text-sm">
                      {stats?.last_backup ? formatDate(stats.last_backup) : '—'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/backup')}
                >
                  إدارة النسخ الاحتياطي
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Templates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            آخر التصميمات
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/templates')}>
            عرض الكل
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : stats?.recent_templates && stats.recent_templates.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.recent_templates.map((template) => (
                <div
                  key={template.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-2 group-hover:ring-2 ring-primary transition-all">
                    {template.thumbnail_path ? (
                      <img
                        src={template.thumbnail_path}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Palette className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.code}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لا توجد تصميمات"
              description="لم يتم إضافة أي تصميمات بعد"
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            آخر النشاطات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">{log.user_name?.charAt(0) || '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.user_name || 'نظام'}</span>
                      {' '}
                      <span className="text-muted-foreground">{log.action}</span>
                      {' '}
                      <span className="font-medium">{log.entity_type}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لا توجد نشاطات"
              description="لم يتم تسجيل أي نشاطات بعد"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
