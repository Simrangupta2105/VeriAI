import React from 'react';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';

export default function PipelineStepper({ stages, totalDurationMs }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between text-xs text-gray-600 border-b border-gray-200 pb-2">
        <span className="font-semibold text-gray-700 uppercase tracking-wider font-mono">
          Verification Pipeline Telemetry
        </span>
        <div className="flex items-center space-x-1.5 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          <Clock className="w-3 h-3" />
          <span>Total: {(totalDurationMs / 1000).toFixed(2)}s</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {stages.map((stage, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{stage.stage}</span>
                <span className="text-[10px] text-gray-600 font-mono">
                  {stage.duration_ms}ms · {stage.detail}
                </span>
              </div>
            </div>
            {idx < stages.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:block" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
