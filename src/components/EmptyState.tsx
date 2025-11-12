import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}
export function EmptyState({ icon: Icon, title, description, actionText, onActionClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed rounded-lg bg-secondary/50"
    >
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Icon className="h-10 w-10 text-brand-accent" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
      {actionText && onActionClick && (
        <Button onClick={onActionClick} className="mt-6 bg-brand-accent hover:bg-brand-accent/90">
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}