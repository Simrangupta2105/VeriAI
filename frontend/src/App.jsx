import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuestionInput from './components/QuestionInput';
import ProviderSelector from './components/ProviderSelector';
import ModeSelector from './components/ModeSelector';
import PipelineStepper from './components/PipelineStepper';
import SynthesizedAnswerCard from './components/SynthesizedAnswerCard';
import ClaimExplorer from './components/ClaimExplorer';
import ModelResponseCard from './components/ModelResponseCard';
import SourceList from './components/SourceList';
import ApiKeyModal from './components/ApiKeyModal';
import DocumentVerificationView from './components/DocumentVerificationView';
import EvaluationView from './components/EvaluationView';

import {
  executeResearch,
  getStoredApiKeys,
  saveStoredApiKeys,
  clearStoredApiKeys,
} from './services/api';
import { AlertCircle, Download, RotateCcw, Sun, Moon } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('research');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [userKeys, setUserKeys] = useState({});
  const [isDark, setIsDark] = useState(() => localStorage.getItem('veriai-theme') === 'dark');

  // Research State
  const [question, setQuestion] = useState(
    'Where is the Taj Mahal located, who commissioned it, and who was the chief architect?'
  );
  const [mode, setMode] = useState('deep');
  const [selectedProviders, setSelectedProviders] = useState(['mock_gpt', 'mock_gemini', 'mock_claude']);
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('veriai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Load keys from localStorage on mount
  useEffect(() => {
    const loaded = getStoredApiKeys();
    setUserKeys(loaded);

    // If user has real keys, adapt initial selected providers
    const active = [];
    if (loaded.gemini) active.push('gemini');
    else active.push('mock_gemini');

    if (loaded.openai) active.push('openai');
    else active.push('mock_gpt');

    if (loaded.anthropic) active.push('anthropic');
    else active.push('mock_claude');

    setSelectedProviders(active);
  }, []);

  const handleSaveKeys = (newKeys) => {
    saveStoredApiKeys(newKeys);
    setUserKeys(newKeys);

    // Update active providers to use live keys where provided
    setSelectedProviders((prev) => {
      const next = [...prev];
      if (newKeys.gemini && next.includes('mock_gemini')) {
        next.splice(next.indexOf('mock_gemini'), 1, 'gemini');
      }
      if (newKeys.openai && next.includes('mock_gpt')) {
        next.splice(next.indexOf('mock_gpt'), 1, 'openai');
      }
      if (newKeys.anthropic && next.includes('mock_claude')) {
        next.splice(next.indexOf('mock_claude'), 1, 'anthropic');
      }
      return next;
    });
  };

  const handleClearKeys = () => {
    clearStoredApiKeys();
    setUserKeys({});
    setSelectedProviders(['mock_gpt', 'mock_gemini', 'mock_claude']);
  };

  const handleResearch = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await executeResearch({
        question,
        mode,
        providers: selectedProviders,
        allow_demo_fallback: true,
      });
      setResearchData(data);
    } catch (err) {
      setError(err.message || 'Verification pipeline encountered an unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!researchData) return;
    const jsonStr = JSON.stringify(researchData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veriai-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasAnyKey = Boolean(
    userKeys?.gemini || userKeys?.openai || userKeys?.anthropic || userKeys?.groq
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenApiKeyModal={() => setIsKeyModalOpen(true)}
        hasKeys={hasAnyKey}
        isDark={isDark}
        onToggleTheme={() => setIsDark(prev => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {currentTab === 'research' && (
          <div className="space-y-6">
            {/* Mission / Context banner */}
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-r from-white dark:from-slate-900 via-gray-50 dark:via-slate-800 to-white dark:to-slate-900 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-700">Demo Mode</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                  Multi-LLM Hallucination Verification Platform
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  VeriAI cross-references claims across parallel LLMs, isolates disagreements, and evaluates
                  propositions against authoritative external records rather than trusting an unverified LLM judge.
                </p>
              </div>

              {researchData && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleExportReport}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Export JSON Report</span>
                  </button>
                  <button
                    onClick={() => {
                      setResearchData(null);
                      setQuestion('');
                    }}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
                    title="Reset view"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Query Input & Configuration */}
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-5 sm:p-6 space-y-5 shadow-sm">
              <QuestionInput
                question={question}
                setQuestion={setQuestion}
                onSearch={handleResearch}
                loading={loading}
                mode={mode}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-gray-200 dark:border-slate-600">
                <ProviderSelector
                  selectedProviders={selectedProviders}
                  setSelectedProviders={setSelectedProviders}
                  userKeys={userKeys}
                  onOpenKeysModal={() => setIsKeyModalOpen(true)}
                />
                <ModeSelector mode={mode} setMode={setMode} />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start space-x-3 shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-500" />
                <div className="space-y-1">
                  <span className="font-semibold block">Execution Notice</span>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Live Pipeline Telemetry */}
            {researchData?.pipeline_stages && (
              <PipelineStepper
                stages={researchData.pipeline_stages}
                totalDurationMs={researchData.duration_ms}
              />
            )}

            {/* Results Section */}
            {researchData && (
              <div className="space-y-6">
                {/* Final Synthesized Answer */}
                <SynthesizedAnswerCard
                  answer={researchData.synthesized_answer}
                  metrics={researchData.verification_metrics}
                  question={researchData.question}
                />

                {/* Claim-Level Verification Explorer */}
                {researchData.claims && researchData.claims.length > 0 && (
                  <ClaimExplorer claims={researchData.claims} />
                )}

                {/* Side-by-side Raw Model Outputs */}
                {researchData.model_responses && (
                  <ModelResponseCard responses={researchData.model_responses} />
                )}

                {/* External Authoritative Sources */}
                {researchData.sources && researchData.sources.length > 0 && (
                  <SourceList sources={researchData.sources} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Document Grounding Tab */}
        {currentTab === 'documents' && <DocumentVerificationView />}

        {/* Academic Benchmark Evaluation Tab */}
        {currentTab === 'eval' && <EvaluationView />}
      </main>

      {/* BYOK API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        userKeys={userKeys}
        onSaveKeys={handleSaveKeys}
        onClearKeys={handleClearKeys}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 py-6 text-center text-xs text-gray-600 dark:text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VeriAI Academic Platform · Multi-LLM Fact Verification</span>
          <span>Designed for empirical hallucination mitigation & evidence grounding</span>
        </div>
      </footer>
    </div>
  );
}
