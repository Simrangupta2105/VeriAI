import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Textarea } from '../ui/Textarea';
import { useGenerateAnswer } from '../../hooks/useVeriApi';
import { Search, Sparkles } from 'lucide-react';

interface CheckerInputCardProps {
  onVerify: (data: { question: string; answer: string; modelName: string; enableCritic: boolean }) => void;
  isLoading: boolean;
  initialQuestion?: string;
  initialAnswer?: string;
}

const PRESETS = [
  {
    label: 'SpaceX Founding Date',
    question: 'When was SpaceX founded and when did it launch its first rocket?',
    answer: 'Elon Musk founded SpaceX in 1999 and the aerospace company successfully launched its first orbital rocket in 2008.',
  },
  {
    label: 'Telephone Invention',
    question: 'Who invented the telephone and when?',
    answer: 'Alexander Graham Bell invented the telephone in 1876 and received the official patent for the acoustic telegraph.',
  },
  {
    label: 'Apollo 11 Landing',
    question: 'When did Apollo 11 land on the moon?',
    answer: 'The Apollo 11 lunar module landed on the Moon on July 20, 1969. Commander Neil Armstrong and lunar module pilot Buzz Aldrin were the first humans to step onto the lunar surface.',
  },
  {
    label: 'Phantom Citation',
    question: 'What is quantum harmonic resonance?',
    answer: "Dr. Arthur Pendelton proved quantum harmonic resonance in his landmark 2019 Nature paper 'Resonance in Quantum Gravity'. The experiment proved that gravity waves reverse under 4 Kelvin temperatures.",
  },
];

export const CheckerInputCard: React.FC<CheckerInputCardProps> = ({
  onVerify,
  isLoading,
  initialQuestion = '',
  initialAnswer = '',
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'generate'>('paste');
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
  const [modelName, setModelName] = useState('hybrid-verifier-v1');
  const [enableCritic, setEnableCritic] = useState(true);

  const generateMutation = useGenerateAnswer();

  const handleSelectPreset = (p: typeof PRESETS[0]) => {
    setQuestion(p.question);
    setAnswer(p.answer);
  };

  const handleGenerate = () => {
    if (!question.trim()) return;
    generateMutation.mutate(
      { question: question.trim(), model: modelName },
      {
        onSuccess: (res) => {
          setAnswer(res.answer);
        },
      }
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() && !answer.trim()) return;
    onVerify({
      question: question.trim() || 'Verified proposition inquiry',
      answer: answer.trim(),
      modelName,
      enableCritic,
    });
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Top Control Bar: Tabs & Model */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-rule">
          <Tabs
            tabs={[
              { id: 'paste', label: 'Paste AI Output' },
              { id: 'generate', label: 'Query Reference Model' },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />

          <div className="w-56">
            <Select
              options={[
                { value: 'hybrid-verifier-v1', label: 'Hybrid Offline Verifier' },
                { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
              ]}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
        </div>

        {/* Question Field */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-muted block">
            Target Inquiry / Question
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. When was SpaceX founded and when did it launch its first rocket?"
              className="flex-1 px-3 py-2 text-xs sm:text-sm font-sans rounded border border-rule bg-surface text-ink focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
            />
            {activeTab === 'generate' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGenerate}
                isLoading={generateMutation.isPending}
                disabled={!question.trim()}
                icon={<Sparkles className="w-3.5 h-3.5 text-teal" />}
              >
                Generate
              </Button>
            )}
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-ink-muted text-[11px]">Benchmark Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className="px-2 py-0.5 rounded border border-rule bg-surface-subtle text-ink-muted hover:text-ink hover:border-rule-strong transition-colors text-[11px]"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Answer Textarea */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Text Passage for Audit
            </label>
            <div className="flex items-center gap-3 font-mono text-[11px] text-ink-muted">
              <span>{wordCount} words</span>
              {answer && (
                <button
                  type="button"
                  onClick={() => setAnswer('')}
                  className="hover:text-ink underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <Textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Paste synthetic or drafted text to decompose into atomic propositions..."
          />
        </div>

        {/* Footer Toggle & Submit */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-rule">
          <Toggle
            label="Adversarial Critic Pass"
            description="Audits verdicts against potential confirmation bias and temporal mismatches."
            checked={enableCritic}
            onChange={setEnableCritic}
          />

          <Button
            type="submit"
            size="md"
            isLoading={isLoading}
            disabled={!answer.trim()}
            icon={<Search className="w-4 h-4" />}
          >
            {isLoading ? 'Executing Audit...' : 'Execute Audit'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
