import React from 'react';
import { Zap, GitCompare, SearchCheck } from 'lucide-react';

export default function ModeSelector({ mode, setMode }) {
  const modes = [
    {
      id: 'quick',
      title: 'Quick Mode',
      desc: 'Single LLM baseline response',
      icon: Zap,
      badge: 'Fastest',
    },
    {
      id: 'verify',
      title: 'Verify Mode',
      desc: 'Multi-LLM agreement & claim discrepancy detection',
      icon: GitCompare,
      badge: 'Cross-Check',
    },
    {
      id: 'deep',
      title: 'Deep Research',
      desc: 'Multi-LLM + Web Evidence + Claim Verification + Grounded Synthesis',
      icon: SearchCheck,
      badge: 'Full Verification',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Verification Depth
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`cursor-pointer rounded-lg border p-3.5 transition-all select-none relative overflow-hidden ${
                isActive
                  ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-200'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {m.title}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-blue-100 text-blue-600 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {m.badge}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{m.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
