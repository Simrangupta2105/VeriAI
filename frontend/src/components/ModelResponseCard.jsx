import React, { useState } from 'react';
import { Bot, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ModelResponseCard({ responses }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!responses || responses.length === 0) return null;

  const current = responses[selectedIdx] || responses[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Raw Model Outputs</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {responses.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                selectedIdx === idx
                  ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {r.provider_name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-600 border-b border-gray-200 pb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">{current.provider_name}</span>
            <span className="font-mono text-gray-500 text-[11px]">({current.model_name})</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 font-mono text-gray-600">
              <Clock className="w-3 h-3 text-gray-600" />
              <span>{current.latency_ms}ms</span>
            </span>
            {current.status === 'success' ? (
              <span className="flex items-center space-x-1 text-green-600 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Success</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-red-600 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>Failed</span>
              </span>
            )}
          </div>
        </div>

        {current.status === 'error' ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            {current.error || 'Failed to generate response'}
          </div>
        ) : (
          <div className="text-sm text-gray-800 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto pr-2">
            {current.content}
          </div>
        )}
      </div>
    </div>
  );
}
