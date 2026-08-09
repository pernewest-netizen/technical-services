import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, categoryApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { useUIStore } from '@/stores';
import {
  Card, CardContent, Button, Badge, EmptyState, GridSkeleton,
  Dialog, Input
} from '@/components/ui';
import { Package, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category_id: null as number | null,
    size: '',
  });
  const { addToast, showConfirm } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 50,
      });
      setProducts(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل تحميل المنتجات', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const req = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id,
        size: formData.size || null,
      };
      if (editingProduct) {
        await productApi.update(editingProduct.id, req);
        addToast({ type: 'success', title: 'تم تحديث المنتج' });
      } else {
        await productApi.create(req);
        addToast({ type: 'success', title: 'تم إضافة المنتج' });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ code: '', name: '', description: '', category_id: null, size: '' });
      loadProducts();
    } catch (err: any) {
      addToast({ type: 'error', title: 'فشل الحفظ', message: err.message });
    }
  };

  const handleDelete = (product: Product) => {
    showConfirm({
      title: 'حذف المنتج',
      message: `هل أنت متأكد من حذف "${product.name}"؟`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await productApi.delete(product.id);
          addToast({ type: 'success', title: 'تم الحذف' });
          loadProducts();
        } catch (err: any) {
          addToast({ type: 'error', title: 'فشل الحذف', message: err.message });
        }
      },
    });
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ code: '', name: '', description: '', category_id: null, size: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground">إدارة المنتجات والتصنيفات</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في المنتجات..."
            className="pr-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">جميع الأقسام</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <GridSkeleton count={8} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); /* openEdit(product) */ }}
                      className="p-1.5 rounded-lg hover:bg-accent"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold mt-3">{product.name}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">{product.code}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {product.category_name && (
                    <Badge variant="secondary" className="text-xs">{product.category_name}</Badge>
                  )}
                  {product.size && (
                    <Badge variant="outline" className="text-xs">{product.size}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد منتجات"
          description="لم يتم إضافة أي منتجات بعد"
          action={<Button onClick={openCreate}>إضافة منتج</Button>}
        />
      )}

      {/* Create Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="إضافة منتج جديد"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">الكود</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="PROD-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">الاسم</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسم المنتج"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">القسم</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">اختر القسم</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.display_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">المقاس</label>
            <Input
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="مثال: 30x30 cm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف المنتج..."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">إضافة</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
