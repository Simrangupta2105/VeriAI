import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      className={twMerge('flex border-b border-rule gap-6', className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 pb-2.5 pt-1 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px select-none',
              isActive
                ? 'border-teal text-ink font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-rule-strong'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'font-mono text-[10px] px-1.5 py-0.2 rounded border',
                  isActive
                    ? 'bg-teal-surface text-teal border-teal/30'
                    : 'bg-surface-subtle text-ink-muted border-rule'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
