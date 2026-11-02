import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { siteConfig } from '../config/site';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
        {/* Header */}
        <div className="space-y-4 border-b border-rule pb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-teal block">
            Public Interest Reference Charter
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
            Inspection Protocol & Reference Methodology
          </h1>
          <p className="text-base text-ink-muted leading-relaxed font-sans max-w-2xl">
            VeriAI operates as a public-interest research instrument. We document below our scoring criteria, knowledge base integrations, and boundary limits.
          </p>
        </div>

        {/* The Non-Profit Commitment */}
        <Card className="p-6 sm:p-8 space-y-4 bg-surface">
          <span className="font-mono text-xs uppercase tracking-wider text-teal block font-semibold">
            Institutional Charter
          </span>
          <h2 className="font-display text-2xl font-bold text-ink">
            A Public Reference Standard for Synthetic Prose
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed font-sans">
            As generative architectures become ubiquitous in search indexes, newsrooms, and scholarly publishing, the ability to independently verify propositions against primary historical and scientific registers must remain an unencumbered public utility.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-rule font-mono text-xs">
            <div>
              <strong className="text-ink block">No Paywalls</strong>
              <span className="text-ink-muted text-[11px] font-sans">Unrestricted access for researchers, journalists, and students.</span>
            </div>
            <div>
              <strong className="text-ink block">Zero Commercial Exploitation</strong>
              <span className="text-ink-muted text-[11px] font-sans">Submitted queries are never stored on external ad trackers or harvested.</span>
            </div>
            <div>
              <strong className="text-ink block">Transparent Proofs</strong>
              <span className="text-ink-muted text-[11px] font-sans">Every verification decision cites retrieved evidence identifiers and scores.</span>
            </div>
          </div>
        </Card>

        {/* Scoring Engine & Formula */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-teal block">
              Mathematical Foundation
            </span>
            <h2 className="font-display text-2xl font-bold text-ink">
              Reliability & Discrepancy Formulations
            </h2>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <Card className="p-5 space-y-2">
              <div className="font-bold text-ink text-sm">Evidence Corroboration Index (0–100)</div>
              <p className="text-ink-muted font-sans text-xs leading-relaxed">
                Aggregates claim importance, model confidence, and publisher provenance scores using a weighted harmonic aggregation. Claims with higher factual importance penalize the index disproportionately when uncorroborated.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="font-bold text-ink text-sm">Hallucination & Discrepancy Risk (%)</div>
              <p className="text-ink-muted font-sans text-xs leading-relaxed">
                Quantifies the ratio and severity of verified factual contradictions, temporal inversions, and invented citations. Discrepancies in critical claims incur exponential penalties.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="font-bold text-ink text-sm">Provenance Rubric (0–100)</div>
              <p className="text-ink-muted font-sans text-xs leading-relaxed">
                Government & statutory repositories: 92–100. Peer-reviewed literature & scholarly archives: 88–95. Established reference encyclopedias (Wikipedia REST): 75–85. Mainstream journalism: 70–82. User-generated discussion boards: 20–30.
              </p>
            </Card>
          </div>
        </div>

        {/* Boundary Conditions & Limitations */}
        <Card className="p-6 sm:p-8 border-rule bg-surface-subtle space-y-3">
          <span className="font-mono text-xs uppercase tracking-wider text-ochre block font-semibold">
            Boundary Conditions & Limitations
          </span>
          <h3 className="font-display text-lg font-bold text-ink">
            Documented Constraints of Automated Verification
          </h3>
          <ul className="space-y-2 text-xs text-ink-muted list-disc list-inside font-sans leading-relaxed">
            <li>
              <strong>Active controversies</strong>: Historical inquiries with competing interpretations among historians will appropriately receive PARTIALLY_SUPPORTED or UNVERIFIED classifications.
            </li>
            <li>
              <strong>Real-time events</strong>: Breaking news occurring hours prior to inquiry will lack comprehensive Wikipedia coverage and may return UNVERIFIED.
            </li>
            <li>
              <strong>Private / Paywalled Corpora</strong>: The desk strictly respects robots.txt and paywalls; proprietary scholarly databases requiring individual subscriptions cannot be directly fetched.
            </li>
          </ul>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-rule font-mono text-xs">
          <div className="flex items-center gap-3">
            <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-teal underline">
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-rule">•</span>
            <a href={siteConfig.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-teal underline">
              <span>Technical README</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <Link to="/check">
            <Button size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Open Audit Desk
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default About;
