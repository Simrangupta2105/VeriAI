import React from 'react';
import { Search, Loader2, Sparkles, CornerDownLeft } from 'lucide-react';

export default function QuestionInput({
  question,
  setQuestion,
  onSearch,
  loading,
  mode
}) {
  const sampleQueries = [
    {
      label: 'Taj Mahal Location & Architect',
      query: 'Where is the Taj Mahal located, who commissioned it, and who was the chief architect?',
    },
    {
      label: 'iPhone Launch Date (Disagreement Test)',
      query: 'What year was the original Apple iPhone officially released for public sale?',
    },
    {
      label: 'RISC-V vs ARM Licensing',
      query: 'What are the architectural licensing differences and advantages of RISC-V over ARM?',
    },
    {
      label: 'Nuclear vs Fossil Safety',
      query: 'Is nuclear energy empirically safer than fossil fuels per terawatt-hour produced?',
    },
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && question.trim()) {
        onSearch();
      }
    }
  };

  const wordCount = question.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = question.length;
  const maxWords = 200;

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a factual question to verify across multiple LLMs and external evidence..."
          className="w-full bg-transparent px-4 pt-3.5 pb-12 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none resize-none"
        />

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center space-x-1 hidden sm:flex">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-600 font-mono text-[10px]">Enter</kbd>
            <span>to research, Shift+Enter for new line</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-gray-500 font-mono">
              {wordCount} / {maxWords} words · {charCount} chars
            </span>

            <button
              type="button"
              onClick={onSearch}
              disabled={loading || !question.trim()}
              className={`ml-auto flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                loading || !question.trim()
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Research & Verify</span>
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preset benchmark queries */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-600 flex items-center space-x-1 shrink-0">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Benchmark Demos:</span>
        </span>
        {sampleQueries.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuestion(item.query)}
            className="shrink-0 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
