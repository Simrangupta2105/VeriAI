import React, { useState } from 'react';
import { clsx } from 'clsx';
import { VerdictType } from '../../types';
import { VERDICT_MAP } from '../../lib/verdict';

export interface TextAnnotation {
  id: string; // e.g. "C01"
  spanText: string;
  verdict: VerdictType | string;
  note?: string;
  citation?: string;
}

export interface AnnotatedTextProps {
  text: string;
  annotations: TextAnnotation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

export const AnnotatedText: React.FC<AnnotatedTextProps> = ({
  text,
  annotations,
  selectedId,
  onSelect,
  className,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeId = selectedId || hoveredId;

  if (!annotations || annotations.length === 0) {
    return (
      <div className={clsx('font-sans text-sm sm:text-base leading-relaxed text-ink p-5 bg-surface border border-rule rounded', className)}>
        {text}
      </div>
    );
  }

  type Segment =
    | { type: 'text'; text: string }
    | { type: 'annotation'; annotation: TextAnnotation; text: string };

  let segments: Segment[] = [];
  let remaining = text;

  const sorted = [...annotations]
    .map((ann) => ({
      ann,
      index: remaining.indexOf(ann.spanText.trim()),
    }))
    .filter((item) => item.index !== -1)
    .sort((a, b) => a.index - b.index);

  let cursor = 0;
  for (const item of sorted) {
    const startIdx = text.indexOf(item.ann.spanText.trim(), cursor);
    if (startIdx !== -1) {
      if (startIdx > cursor) {
        segments.push({ type: 'text', text: text.substring(cursor, startIdx) });
      }
      segments.push({
        type: 'annotation',
        annotation: item.ann,
        text: item.ann.spanText.trim(),
      });
      cursor = startIdx + item.ann.spanText.trim().length;
    }
  }

  if (cursor < text.length) {
    segments.push({ type: 'text', text: text.substring(cursor) });
  }

  if (segments.length === 0) {
    segments = [{ type: 'text', text }];
  }

  return (
    <div className={clsx('grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start', className)}>
      {/* Document Body: 8 columns on desktop (1024px+), full width on mobile/tablet */}
      <div className="lg:col-span-8 p-5 sm:p-7 md:p-8 bg-surface border border-rule rounded font-sans text-sm sm:text-base leading-relaxed text-ink relative shadow-hairline">
        {/* Document Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule font-mono text-[10px] sm:text-xs text-ink-muted uppercase tracking-wider">
          <span>Proofread Document</span>
          <span>Editorial Markings Active</span>
        </div>

        {/* Annotated Prose */}
        <div className="space-y-4">
          <p className="leading-relaxed whitespace-pre-wrap">
            {segments.map((seg, idx) => {
              if (seg.type === 'text') {
                return <span key={idx}>{seg.text}</span>;
              }

              const ann = seg.annotation;
              const config = VERDICT_MAP[ann.verdict as VerdictType] || VERDICT_MAP.UNVERIFIED;
              const isFocused = activeId === ann.id;

              return (
                <span
                  key={ann.id}
                  onMouseEnter={() => setHoveredId(ann.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect?.(ann.id)}
                  className={clsx(
                    'cursor-pointer transition-colors px-1 py-0.5 rounded-sm inline group touch-manipulation',
                    config.annotationClass,
                    isFocused && 'ring-2 ring-teal ring-offset-1'
                  )}
                  title={`${ann.id}: ${config.label}`}
                >
                  {seg.text}
                  <sup className="font-mono text-[9px] font-bold ml-1 text-ink-muted opacity-80 group-hover:opacity-100 select-none">
                    [{ann.id} • {config.code}]
                  </sup>
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Marginalia Annotations: 4 columns on desktop (1024px+), stacked below on mobile with inline notes */}
      <div className="lg:col-span-4 space-y-3 font-mono text-xs">
        <div className="text-[10px] sm:text-xs uppercase tracking-wider text-ink-muted font-bold pb-2 border-b border-rule flex items-center justify-between">
          <span>Marginalia Annotations</span>
          <span className="text-teal">[{annotations.length} Claims]</span>
        </div>

        <div className="space-y-2.5">
          {annotations.map((ann) => {
            const config = VERDICT_MAP[ann.verdict as VerdictType] || VERDICT_MAP.UNVERIFIED;
            const Icon = config.icon;
            const isFocused = activeId === ann.id;

            return (
              <div
                key={ann.id}
                onMouseEnter={() => setHoveredId(ann.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect?.(ann.id)}
                className={clsx(
                  'p-3.5 rounded border transition-all duration-150 cursor-pointer bg-surface text-ink min-h-[44px] flex flex-col justify-center',
                  isFocused
                    ? 'border-teal ring-1 ring-teal shadow-hairline'
                    : 'border-rule hover:border-rule-strong'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <span className="text-ink">{ann.id}</span>
                    <span className="text-ink-muted">•</span>
                    <span className={config.colorClass}>{config.code}</span>
                  </div>
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] border',
                      config.badgeClass
                    )}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    <span>{config.shortLabel}</span>
                  </span>
                </div>

                {ann.note && (
                  <p className="font-sans text-[11px] sm:text-xs text-ink-muted leading-snug">
                    {ann.note}
                  </p>
                )}

                {ann.citation && (
                  <div className="mt-1 text-[10px] text-teal font-mono truncate">
                    Ref: {ann.citation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
