import React, { useState } from 'react';
import { Bot, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ModelResponseCard({ responses }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!responses || responses.length === 0) return null;

  const current = responses[selectedIdx] || responses[0];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Raw Model Outputs</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {responses.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                selectedIdx === idx
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {r.provider_name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 pb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-slate-100">{current.provider_name}</span>
            <span className="font-mono text-gray-500 dark:text-slate-500 text-[11px]">({current.model_name})</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 font-mono text-gray-600 dark:text-slate-400">
              <Clock className="w-3 h-3 text-gray-600 dark:text-slate-400" />
              <span>{current.latency_ms}ms</span>
            </span>
            {current.status === 'success' ? (
              <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Success</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-red-600 dark:text-red-400 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>Failed</span>
              </span>
            )}
          </div>
        </div>

        {current.status === 'error' ? (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {current.error || 'Failed to generate response'}
          </div>
        ) : (
          <div className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto pr-2">
            {current.content}
          </div>
        )}
      </div>
    </div>
  );
}
