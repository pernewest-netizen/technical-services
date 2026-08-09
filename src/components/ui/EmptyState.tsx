import React from 'react';
import { cn } from '@/lib/utils';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'لا يوجد بيانات',
  description = 'لم يتم العثور على أي عناصر',
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || <PackageOpen className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
