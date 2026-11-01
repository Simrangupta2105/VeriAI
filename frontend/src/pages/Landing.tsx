import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { FactDeskHero } from '../components/landing/FactDeskHero';
import { FeatureTicker } from '../components/landing/FeatureTicker';
import { VerificationLedger } from '../components/landing/VerificationLedger';
import { AuditProtocol } from '../components/landing/AuditProtocol';
import { BenchmarkRecord } from '../components/landing/BenchmarkRecord';
import { EditorialNotes } from '../components/landing/EditorialNotes';
import { DeskCallout } from '../components/landing/DeskCallout';

export const Landing: React.FC = () => {
  return (
    <PageContainer>
      {/* 1. Masthead & Signature Proofread Document */}
      <FactDeskHero />

      {/* 2. Single Continuous Capability Ticker Strip */}
      <FeatureTicker />

      {/* 3. Failure Mode Inspection Ledger */}
      <VerificationLedger />

      {/* 4. 6-Stage Reference Audit Protocol */}
      <AuditProtocol />

      {/* 5. Empirical Benchmark Rigor with Viewport Count-Ups */}
      <BenchmarkRecord />

      {/* 6. Editorial Desk Notes & FAQ (2-column layout at 1024px+) */}
      <EditorialNotes />

      {/* 7. Closing Editorial Callout */}
      <DeskCallout />
    </PageContainer>
  );
};

export default Landing;
