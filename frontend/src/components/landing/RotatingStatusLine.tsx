import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Scissors, Search, Scale, CheckCircle2, FileCheck } from 'lucide-react';

const STATUS_ITEMS = [
  { text: 'Extracting atomic claims', icon: Scissors },
  { text: 'Searching open archives', icon: Search },
  { text: 'Weighing source provenance', icon: Scale },
  { text: 'Auditing factual grounding', icon: CheckCircle2 },
  { text: 'Publishing verification records', icon: FileCheck },
];

export const RotatingStatusLine: React.FC = () => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUS_ITEMS.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  const current = STATUS_ITEMS[index];
  const Icon = current.icon;

  if (shouldReduceMotion) {
    const FirstIcon = STATUS_ITEMS[0].icon;
    return (
      <div className="flex items-center gap-2 font-mono text-xs text-ink-muted select-none py-1">
        <FirstIcon className="w-3.5 h-3.5 text-teal shrink-0" />
        <span>{STATUS_ITEMS[0].text}</span>
      </div>
    );
  }

  return (
    <div className="h-6 overflow-hidden flex items-center font-mono text-xs text-ink-muted select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center gap-2 text-ink"
        >
          <Icon className="w-3.5 h-3.5 text-teal shrink-0" />
          <span className="font-medium tracking-tight">{current.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

