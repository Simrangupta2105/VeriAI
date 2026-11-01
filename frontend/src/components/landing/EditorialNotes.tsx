import React from 'react';
import { Accordion } from '../ui/Accordion';

export const EditorialNotes: React.FC = () => {
  const notes = [
    {
      id: 'note-1',
      category: 'Taxonomy',
      title: 'What constitutes an ungrounded proposition in synthetic text?',
      content: (
        <p>
          Synthetic text frequently produces statements that are syntactically well-formed but lack correspondence to physical, historical, or empirical reality. These range from fabricated biographical events and wrong founding dates to ghost publications with fictitious volume identifiers and synthetic DOIs.
        </p>
      ),
    },
    {
      id: 'note-2',
      category: 'Inference',
      title: 'Why is asking a chatbot to verify itself fundamentally flawed?',
      content: (
        <p>
          Generative architectures prioritize semantic continuity rather than independent truth lookup. When prompted with "Is this answer correct?", a model operates under the same biased latent representations that generated the error initially, resulting in defensive sycophancy. True verification requires external authoritative grounding.
        </p>
      ),
    },
    {
      id: 'note-3',
      category: 'Compatibility',
      title: 'Which AI models and prompt outputs can be evaluated?',
      content: (
        <p>
          VeriAI is model-agnostic. You can audit output from OpenAI models (GPT-4o, o1), Anthropic Claude, Google Gemini, Perplexity, Meta Llama, DeepSeek, or any open-weights model. You can also generate an initial baseline directly via our offline hybrid model registry.
        </p>
      ),
    },
    {
      id: 'note-4',
      category: 'Governance & Privacy',
      title: 'Is submitted text stored, analyzed for commercial ads, or sold?',
      content: (
        <p>
          No. VeriAI is a non-profit public research tool. We do not maintain commercial user tracking, train generative foundational models on your submitted prose, or monetize queries. Audits are stored within your local SQLite database instance for private reference.
        </p>
      ),
    },
    {
      id: 'note-5',
      category: 'Boundaries',
      title: 'What are the system limits and edge cases?',
      content: (
        <p>
          VeriAI is an auditing instrument, not an omniscient authority. Fast-breaking news occurring within minutes of submission may not yet be recorded in indexed encyclopedia corpora. Similarly, unresolved academic controversies where peer sources actively dispute claims will receive UNVERIFIED or PARTIALLY_SUPPORTED classifications. Users should always review the clickable source links provided in each report.
        </p>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column at 1024px+, Stacked below */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (4 cols at 1024+) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-teal block">
              Desk Notes & Standards
            </span>
            <h2 className="font-display text-fluid-subhead font-bold tracking-tight text-ink">
              Frequently examined questions.
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed font-sans">
              Clarifications on our verification standards, inference limits, publisher credibility rubrics, and non-profit research charter.
            </p>
            <div className="p-4 rounded border border-rule bg-surface-subtle font-mono text-[11px] text-ink-muted hidden lg:block space-y-1">
              <span className="font-bold text-ink block uppercase text-[10px]">Reference Assistance</span>
              <span>Audits cite primary evidence tokens and can be exported as raw JSON or plain-text traces.</span>
            </div>
          </div>

          {/* Right Column: Accordion (8 cols at 1024+) */}
          <div className="lg:col-span-8">
            <Accordion items={notes} defaultOpenId="note-1" />
          </div>
        </div>
      </div>
    </section>
  );
};
