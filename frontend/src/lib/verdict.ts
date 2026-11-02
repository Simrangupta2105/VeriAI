import { VerdictType } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Info } from 'lucide-react';
import React from 'react';

export interface VerdictConfig {
  type: VerdictType;
  label: string;
  shortLabel: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  annotationClass: string;
  description: string;
}

export const VERDICT_MAP: Record<VerdictType, VerdictConfig> = {
  SUPPORTED: {
    type: 'SUPPORTED',
    label: 'Supported',
    shortLabel: 'Supported',
    code: 'SUP',
    icon: CheckCircle2,
    colorClass: 'text-verdict-supported',
    bgClass: 'bg-verdict-supported-surface',
    borderClass: 'border-verdict-supported/30',
    badgeClass: 'bg-verdict-supported-surface text-verdict-supported border-verdict-supported/40',
    annotationClass: 'mark-supported',
    description: 'Directly corroborated by authoritative independent sources.',
  },
  PARTIALLY_SUPPORTED: {
    type: 'PARTIALLY_SUPPORTED',
    label: 'Partially supported',
    shortLabel: 'Partial',
    code: 'PRT',
    icon: AlertTriangle,
    colorClass: 'text-verdict-partial',
    bgClass: 'bg-verdict-partial-surface',
    borderClass: 'border-verdict-partial/30',
    badgeClass: 'bg-verdict-partial-surface text-verdict-partial border-verdict-partial/40',
    annotationClass: 'mark-partial',
    description: 'Core assertion corroborated, but secondary details, dates, or scope show nuances.',
  },
  CONTRADICTED: {
    type: 'CONTRADICTED',
    label: 'Contradicted',
    shortLabel: 'Refuted',
    code: 'REF',
    icon: XCircle,
    colorClass: 'text-verdict-contra',
    bgClass: 'bg-verdict-contra-surface',
    borderClass: 'border-verdict-contra/30',
    badgeClass: 'bg-verdict-contra-surface text-verdict-contra border-verdict-contra/40',
    annotationClass: 'mark-contradicted',
    description: 'Directly refuted by authoritative historical records or verified reference corpora.',
  },
  UNVERIFIED: {
    type: 'UNVERIFIED',
    label: 'Unverified',
    shortLabel: 'Unverified',
    code: 'UNV',
    icon: HelpCircle,
    colorClass: 'text-verdict-unverified',
    bgClass: 'bg-verdict-unverified-surface',
    borderClass: 'border-verdict-unverified/30',
    badgeClass: 'bg-verdict-unverified-surface text-verdict-unverified border-verdict-unverified/40',
    annotationClass: 'mark-unverified',
    description: 'Insufficient independent authoritative evidence found to corroborate or refute.',
  },
  NOT_FACTUAL: {
    type: 'NOT_FACTUAL',
    label: 'Non-factual / Opinion',
    shortLabel: 'Opinion',
    code: 'OPN',
    icon: Info,
    colorClass: 'text-ink-muted',
    bgClass: 'bg-surface-subtle',
    borderClass: 'border-rule',
    badgeClass: 'bg-surface-subtle text-ink-muted border-rule',
    annotationClass: '',
    description: 'Expresses a subjective value judgment or viewpoint not subject to empirical fact-checking.',
  },
};

export function getVerdictConfig(verdict: string): VerdictConfig {
  return VERDICT_MAP[verdict as VerdictType] || VERDICT_MAP.UNVERIFIED;
}
