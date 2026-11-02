import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface AccordionItem {
  id: string;
  title: string;
  category?: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  allowMultiple = false,
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={clsx('divide-y divide-rule border-y border-rule', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-start justify-between py-4 text-left font-medium text-ink hover:text-teal transition-colors gap-4"
              aria-expanded={isOpen}
            >
              <div className="space-y-1">
                {item.category && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted block">
                    {item.category}
                  </span>
                )}
                <span className="font-display text-base sm:text-lg font-medium text-ink">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                className={clsx(
                  'w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 mt-1',
                  isOpen && 'rotate-180 text-teal'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="pb-5 pt-1 text-sm text-ink-muted leading-relaxed max-w-3xl">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
