import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productionGuideApi } from '@/lib/api';
import { ProductionGuide } from '@/types';
import { useUIStore } from '@/stores';
import { Card, CardContent, Button, Badge, EmptyState, Skeleton, Dialog } from '@/components/ui';
import { BookOpen, Plus, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';

export const ProductionGuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<ProductionGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<ProductionGuide | null>(null);
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => { loadGuides(); }, []);

  const loadGuides = async () => {
    try { setLoading(true); const data = await productionGuideApi.getAll(); setGuides(data); }
    catch (err: any) { addToast({ type: 'error', title: 'فشل التحميل', message: err.message }); }
    finally { setLoading(false); }
  };

  if (selectedGuide) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedGuide(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> العودة
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{selectedGuide.name}</h1>
          <p className="text-muted-foreground">{selectedGuide.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedGuide.product_name && <Badge variant="secondary">{selectedGuide.product_name}</Badge>}
          {selectedGuide.machine_name && <Badge variant="secondary">{selectedGuide.machine_name}</Badge>}
          {selectedGuide.material_name && <Badge variant="secondary">{selectedGuide.material_name}</Badge>}
          {selectedGuide.estimated_time && <Badge variant="outline"><Clock className="w-3 h-3 ml-1" />{selectedGuide.estimated_time}</Badge>}
        </div>
        <div className="space-y-4">
          {selectedGuide.steps.map((step, idx) => (
            <Card key={step.id} className="border-r-4 border-r-primary">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">{step.step_number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{step.title}</h3>
                    {step.description && <p className="text-sm text-muted-foreground mt-1">{step.description}</p>}
                    {step.warning && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {step.warning}
                      </div>
                    )}
                    {step.estimated_time && <p className="text-xs text-muted-foreground mt-2">⏱ {step.estimated_time}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">طرق التنفيذ</h1><p className="text-muted-foreground">دليل خطوات الإنتاج والتنفيذ</p></div>
        <Button onClick={() => navigate('/production-guides/new')}><Plus className="w-4 h-4 ml-2" /> دليل جديد</Button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : guides.length > 0 ? (
        <div className="space-y-3">
          {guides.map(g => (
            <Card key={g.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedGuide(g)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{g.name}</h3>
                  <p className="text-sm text-muted-foreground">{g.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {g.product_name && <Badge variant="secondary" className="text-xs">{g.product_name}</Badge>}
                    {g.machine_name && <Badge variant="secondary" className="text-xs">{g.machine_name}</Badge>}
                    {g.steps.length > 0 && <Badge variant="outline" className="text-xs">{g.steps.length} خطوة</Badge>}
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="لا توجد أدلة" description="لم يتم إضافة أدلة تنفيذ بعد" />}
    </div>
  );
};
