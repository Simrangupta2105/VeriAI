import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const DeskCallout: React.FC = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-12 md:p-16 border border-rule bg-surface-subtle text-ink space-y-6">
          <div className="space-y-4 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-teal block">
              Editorial Imperative
            </span>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
              Verification before publication is standard editorial practice. It should be standard for synthetic text.
            </h2>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Whether preparing an investigative brief, scientific manuscript, or classroom lesson, audit every assertion against independent primary records before citation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-rule">
            <Link to="/check">
              <Button size="lg" icon={<ArrowUpRight className="w-4 h-4" />}>
                Launch the Audit Desk
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">
                Inspection Rubrics & Criteria
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

