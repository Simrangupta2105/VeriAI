import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, VerdictTag } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Accordion } from '../components/ui/Accordion';
import { Gauge } from '../components/ui/Gauge';
import { Skeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/ui/Toast';
import { Toggle } from '../components/ui/Toggle';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Tooltip } from '../components/ui/Tooltip';
import { AnnotatedText } from '../components/ui/AnnotatedText';
import { VERDICT_MAP } from '../lib/verdict';
import { ArrowUpRight } from 'lucide-react';

export const StyleGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('one');
  const [toggleState, setToggleState] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [selectVal, setSelectVal] = useState('hybrid');

  const sampleParagraph =
    "SpaceX was established in 1999 by Elon Musk with headquarters in Hawthorne. Falcon 1 achieved orbit on September 28, 2008, becoming the first privately funded liquid-fueled rocket to do so. The company was awarded a NASA Commercial Resupply Services contract later that year.";

  const sampleAnnotations = [
    {
      id: 'C01',
      spanText: 'SpaceX was established in 1999',
      verdict: 'CONTRADICTED',
      note: 'Official incorporation records and NASA archives verify SpaceX was founded in March 2002.',
      citation: 'SpaceX Registry (Delaware Division of Corps)',
    },
    {
      id: 'C02',
      spanText: 'Falcon 1 achieved orbit on September 28, 2008',
      verdict: 'SUPPORTED',
      note: 'Flight 4 reached low Earth orbit on 28 September 2008, confirmed by telemetry logs.',
      citation: 'FAA Commercial Space Launch Records',
    },
    {
      id: 'C03',
      spanText: 'The company was awarded a NASA Commercial Resupply Services contract later that year',
      verdict: 'SUPPORTED',
      note: 'NASA announced the $1.6B CRS-1 contract award in December 2008.',
      citation: 'NASA Press Release C08-069',
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            Fact-Desk Component Library
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
            Visual System & Primitives
          </h1>
          <p className="text-sm text-ink-muted mt-2 max-w-xl">
            Warm paper (#F7F4EE), deep teal (#0E5A5A), hairline 1px rules, and the proofread document annotation motif.
          </p>
        </div>

        {/* Signature Component: AnnotatedText */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink border-b border-rule pb-2">
            Signature Component: Annotated Proofread Document
          </h2>
          <AnnotatedText text={sampleParagraph} annotations={sampleAnnotations} />
        </section>

        {/* Semicircle Gauge */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink border-b border-rule pb-2">
            Semicircle Evidence Dial
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 flex flex-col items-center">
              <Gauge value={91} label="High Corroboration" />
            </Card>
            <Card className="p-6 flex flex-col items-center">
              <Gauge value={62} label="Mixed Corroboration" />
            </Card>
            <Card className="p-6 flex flex-col items-center">
              <Gauge value={28} label="Contradicted Index" />
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink border-b border-rule pb-2">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Solid Teal Primary</Button>
            <Button variant="secondary">Secondary Paper</Button>
            <Button variant="outline">Hairline Outline</Button>
            <Button variant="text">Text Button</Button>
            <Button variant="danger">Refuted Danger</Button>
            <Button variant="primary" isLoading>Processing</Button>
            <Button variant="primary" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              With Icon
            </Button>
          </div>
        </section>

        {/* Verdict Tags */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink border-b border-rule pb-2">
            Verdict Tags (Icon + Label + Code)
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {Object.keys(VERDICT_MAP).map((k) => (
              <VerdictTag key={k} verdict={k} />
            ))}
          </div>
        </section>

        {/* Tabs & Form Controls */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink border-b border-rule pb-2">
            Underline Tabs & Form Elements
          </h2>
          <div className="space-y-6">
            <Tabs
              tabs={[
                { id: 'one', label: 'All Propositions', count: 12 },
                { id: 'two', label: 'Refuted Claims', count: 3 },
                { id: 'three', label: 'Corroborated', count: 9 },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <Toggle
                  label="Adversarial Audit"
                  description="Challenges lenient source citations against strict temporal records."
                  checked={toggleState}
                  onChange={setToggleState}
                />
                <Select
                  label="Reference Model Registry"
                  options={[
                    { value: 'hybrid', label: 'Hybrid Verifier (Local Archive)' },
                    { value: 'gemini', label: 'Gemini 1.5 Flash' },
                  ]}
                  value={selectVal}
                  onChange={(e) => setSelectVal(e.target.value)}
                />
                <Tooltip content="Audit ID: AUD-8910">
                  <span className="font-mono text-xs underline cursor-help">Hover for reference tooltip</span>
                </Tooltip>
              </Card>

              <Card className="p-5 space-y-4">
                <Textarea
                  label="Input Proposition"
                  placeholder="Paste paragraph to fact-check..."
                  rows={3}
                />
                <Button onClick={() => setToastOpen(true)} variant="outline" size="sm">
                  Trigger Audit Toast
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Accordion */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink border-b border-rule pb-2">
            Editorial Accordion
          </h2>
          <Accordion
            items={[
              {
                id: 'a1',
                category: 'Provenance Protocol',
                title: 'How does the fact-desk grade evidence credibility?',
                content: 'Sources are scored on a 0–100 rubric across domain authority, archival stability, and lexical relevance to the extracted atomic proposition.',
              },
              {
                id: 'a2',
                category: 'Zero-Trust Verification',
                title: 'What happens when no independent records exist?',
                content: 'VeriAI strictly assigns an UNVERIFIED verdict. We never assume an uncorroborated statement is false or true.',
              },
            ]}
          />
        </section>
      </div>

      <Toast
        isOpen={toastOpen}
        message="Audit record archived to local SQLite database."
        onClose={() => setToastOpen(false)}
      />
    </PageContainer>
  );
};

export default StyleGuide;
