import React from 'react';
import { ExternalLink, BookOpen, Globe, Award } from 'lucide-react';

export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Consulted Authoritative Sources</h3>
        </div>
        <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
          {sources.length} citations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-all flex flex-col justify-between space-y-2"
          >
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-gray-900 line-clamp-1">
                  [{idx + 1}] {src.title}
                </span>
                <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0 flex items-center space-x-1">
                  <Award className="w-2.5 h-2.5" />
                  <span>{src.authority_score ? `${Math.round(src.authority_score * 100)}% auth` : 'Verified'}</span>
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 italic">
                "{src.passage}"
              </p>
            </div>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-mono flex items-center space-x-1 text-[11px]">
                <Globe className="w-3 h-3" />
                <span>{src.domain}</span>
              </span>
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 underline text-[11px]"
              >
                <span>Visit Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
