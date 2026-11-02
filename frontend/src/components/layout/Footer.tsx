import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-rule bg-surface/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-ink-muted">
          {/* Masthead Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-bold text-ink">
                {siteConfig.name}
              </span>
              <span className="font-mono text-[10px] uppercase text-ink-muted">
                Reference Audit Desk
              </span>
            </div>
            <p className="leading-relaxed max-w-sm">
              An open, public-interest research tool for decomposing and cross-referencing synthetic text against primary records. Engineered for non-commercial educational, journalistic, and scholarly inquiry.
            </p>
            <div className="font-mono text-[11px] text-ink">
              MIT License • No Accounts • Zero Tracking
            </div>
          </div>

          {/* Section: Audit Tools */}
          <div className="md:col-span-3 space-y-2">
            <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink">
              Desk Tools
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link to="/check" className="hover:text-ink hover:underline">
                  New Fact Audit
                </Link>
              </li>
              <li>
                <Link to="/audits" className="hover:text-ink hover:underline">
                  Local Records Archive
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-ink hover:underline">
                  Methodology & Rubrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Section: Provenance & Source */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink">
              Source & Provenance
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={siteConfig.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink hover:underline"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink hover:underline"
                >
                  Technical Documentation
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink hover:underline"
                >
                  File Defect / Discrepancy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-rule flex flex-col sm:flex-row items-baseline justify-between gap-3 text-[11px] font-mono text-ink-muted">
          <span>VeriAI Reference Fact-Desk • Version 2.0.0</span>
          <span>Open Knowledge Grounds • SQLite Local Persistence</span>
        </div>
      </div>
    </footer>
  );
};
