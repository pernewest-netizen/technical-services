import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateApi, seasonApi, categoryApi, productApi, materialApi } from '@/lib/api';
import { Template, Season, Category, Product, Material } from '@/types';
import { useUIStore } from '@/stores';
import {
  Card, CardContent, Button, Badge, EmptyState, GridSkeleton,
  Dialog, Input
} from '@/components/ui';
import {
  Palette, Plus, Heart, Grid3X3, List, Search, Filter,
  Star, Archive, Edit, Trash2, Eye, FileImage
} from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    seasonId: null as number | null,
    categoryId: null as number | null,
    productId: null as number | null,
    materialId: null as number | null,
    isFavorite: null as boolean | null,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addToast, showConfirm, viewMode: globalViewMode, setViewMode: setGlobalViewMode } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadReferenceData();
    loadTemplates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadTemplates(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const loadReferenceData = async () => {
    try {
      const [seasonsData, catsData, prodsData, matsData] = await Promise.all([
        seasonApi.getAll(false),
        categoryApi.getAll(),
        productApi.getAll({ limit: 100 }),
        materialApi.getAll(),
      ]);
      setSeasons(seasonsData);
      setCategories(catsData);
      setProducts(prodsData);
      setMaterials(matsData);
    } catch (err) {
      console.error('Failed to load reference data:', err);
    }
  };

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await templateApi.getAll({
        seasonId: filters.seasonId || undefined,
        categoryId: filters.categoryId || undefined,
        productId: filters.productId || undefined,
        materialId: filters.materialId || undefined,
        search: searchQuery || undefined,
        isFavorite: filters.isFavorite || undefined,
        limit: 50,
      });
      setTemplates(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل تحميل التصميمات', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const handleToggleFavorite = async (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    try {
      await templateApi.toggleFavorite(template.id);
      addToast({
        type: 'success',
        title: template.is_favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة',
      });
      loadTemplates();
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشلت العملية', message: err.message });
    }
  };

  const handleDelete = (template: Template) => {
    showConfirm({
      title: 'حذف التصميم',
      message: `هل أنت متأكد من حذف "${template.name}"؟`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          // TODO: get userId from auth store
          await templateApi.delete(template.id, 1);
          addToast({ type: 'success', title: 'تم الحذف' });
          loadTemplates();
        } catch (err: any) {
          addToast({ type: 'error', title: 'فشل الحذف', message: err.message });
        }
      },
    });
  };

  const clearFilters = () => {
    setFilters({
      seasonId: null,
      categoryId: null,
      productId: null,
      materialId: null,
      isFavorite: null,
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null) || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التصميمات</h1>
          <p className="text-muted-foreground">مكتبة التصميمات والقوالب</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-card shadow-sm' : 'text-muted-foreground'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => navigate('/templates/new')}>
            <Plus className="w-4 h-4 ml-2" />
            تصميم جديد
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border rounded-xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في التصميمات (اسم، كود، وصف...)"
            className="pr-10"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.seasonId || ''}
            onChange={(e) => setFilters({ ...filters, seasonId: e.target.value ? parseInt(e.target.value) : null })}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">جميع المناسبات</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.display_name}</option>
            ))}
          </select>

          <select
            value={filters.categoryId || ''}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value ? parseInt(e.target.value) : null })}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">جميع الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>

          <select
            value={filters.productId || ''}
            onChange={(e) => setFilters({ ...filters, productId: e.target.value ? parseInt(e.target.value) : null })}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">جميع المنتجات</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filters.materialId || ''}
            onChange={(e) => setFilters({ ...filters, materialId: e.target.value ? parseInt(e.target.value) : null })}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">جميع الخامات</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ ...filters, isFavorite: filters.isFavorite ? null : true })}
            className={cn(
              'h-9 px-3 rounded-lg border text-sm transition-colors flex items-center gap-1.5',
              filters.isFavorite
                ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                : 'border-input bg-background hover:bg-accent'
            )}
          >
            <Star className={cn('w-4 h-4', filters.isFavorite && 'fill-current')} />
            المفضلة فقط
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templates.length} تصميم
        </p>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <GridSkeleton count={12} />
      ) : templates.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => navigate(`/templates/${template.id}`)}
                onToggleFavorite={(e) => handleToggleFavorite(e, template)}
                onDelete={() => handleDelete(template)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">التصميم</th>
                  <th className="text-right px-4 py-3 font-medium">الكود</th>
                  <th className="text-right px-4 py-3 font-medium">المناسبة</th>
                  <th className="text-right px-4 py-3 font-medium">المنتج</th>
                  <th className="text-right px-4 py-3 font-medium">الخامة</th>
                  <th className="text-right px-4 py-3 font-medium">الإصدار</th>
                  <th className="text-right px-4 py-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr
                    key={template.id}
                    className="border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/templates/${template.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {template.thumbnail_path ? (
                            <img src={template.thumbnail_path} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileImage className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {template.tags.slice(0, 2).map((tag) => (
                              <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{template.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{template.season_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{template.product_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{template.material_name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">v{template.current_version}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(e, template); }}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            template.is_favorite ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'
                          )}
                        >
                          <Star className={cn('w-4 h-4', template.is_favorite && 'fill-current')} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(template); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <EmptyState
          title="لا توجد تصميمات"
          description="لم يتم العثور على تصميمات مطابقة للبحث"
          action={<Button onClick={() => navigate('/templates/new')}>إضافة تصميم</Button>}
        />
      )}
    </div>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: Template;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onDelete: () => void;
}> = ({ template, onClick, onToggleFavorite, onDelete }) => {
  return (
    <div
      className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {template.thumbnail_path ? (
          <img
            src={template.thumbnail_path}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Palette className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-red-500/80 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Favorite Badge */}
        <button
          onClick={onToggleFavorite}
          className={cn(
            'absolute top-2 left-2 p-1.5 rounded-full transition-colors',
            template.is_favorite
              ? 'bg-amber-500 text-white'
              : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'
          )}
        >
          <Star className={cn('w-3.5 h-3.5', template.is_favorite && 'fill-current')} />
        </button>

        {/* Version Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-mono">
          v{template.current_version}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{template.name}</h3>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{template.code}</p>
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {template.season_name && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              {template.season_name}
            </span>
          )}
          {template.material_name && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {template.material_name}
            </span>
          )}
        </div>
        {template.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
