import React from 'react';
import { ShieldCheck, Key, FileText, BarChart3, Search, Sparkles } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, onOpenApiKeyModal, hasKeys }) {
  const navItems = [
    { id: 'research', label: 'Research Studio', icon: Search },
    { id: 'documents', label: 'Doc Grounding', icon: FileText },
    { id: 'eval', label: 'Academic Benchmark', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('research')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900 font-mono">Veri<span className="text-blue-600">AI</span></span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono font-semibold">v1.0</span>
            </div>
            <p className="text-xs text-gray-600 hidden sm:block">Multi-LLM Research & Hallucination Verification Platform</p>
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
              hasKeys
                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="hidden md:inline">BYOK Keys</span>
            {hasKeys && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
