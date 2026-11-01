import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useHealth } from '../../hooks/useVeriApi';
import { siteConfig } from '../../config/site';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isSuccess } = useHealth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isChecker = location.pathname === '/check';

  const navLinks = [
    { name: 'Audit Desk', href: '/check' },
    { name: 'Records Archive', href: '/audits' },
    { name: 'Methodology', href: '/about' },
  ];

  // Esc key listener and body scroll lock for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          triggerRef.current?.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Masthead Brand */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-baseline gap-2.5 min-h-[44px] items-center"
          >
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
              {siteConfig.name}
            </span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted border-l border-rule pl-2.5 hidden sm:inline">
              Fact-Desk
            </span>
          </Link>

          {/* Desktop Links (Visible at 768px+) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-xs font-mono font-medium tracking-wider uppercase transition-colors min-h-[44px] inline-flex items-center ${
                    active ? 'text-teal font-bold border-b-2 border-teal -mb-px' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Health indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-rule text-[11px] font-mono text-ink-muted bg-surface min-h-[36px]"
            title="Database & Pipeline Health"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSuccess ? 'bg-verdict-supported' : 'bg-verdict-partial'
              }`}
            />
            <span className="hidden sm:inline">
              {isSuccess ? 'Desk Active' : 'Connecting'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle paper / ink theme"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded border border-rule text-ink-muted hover:text-ink hover:bg-surface transition-colors focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* New Check Action button on Desktop */}
          {!isChecker && (
            <Link
              to="/check"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-teal text-white hover:bg-teal-hover transition-colors min-h-[40px] focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
            >
              <span>New Audit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Mobile hamburger button (<768px, >=44x44px touch target) */}
          <button
            ref={triggerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded border border-rule text-ink hover:bg-surface transition-colors focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-screen Mobile Navigation Drawer with Focus Trap */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-x-0 top-16 bottom-0 z-50 bg-background/98 backdrop-blur-md border-b border-rule flex flex-col justify-between p-6 overflow-y-auto md:hidden"
        >
          <div className="space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-muted pb-2 border-b border-rule">
              Navigation Menu
            </div>
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[48px] px-3 flex items-center text-sm font-mono uppercase tracking-wider rounded border transition-colors ${
                      active
                        ? 'bg-teal-surface text-teal border-teal font-bold'
                        : 'border-rule bg-surface text-ink hover:border-rule-strong'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-6 border-t border-rule font-mono text-xs">
            <Link
              to="/check"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded bg-teal text-white font-semibold text-sm shadow-hairline"
            >
              <span>Launch Fact Audit</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="text-center text-[11px] text-ink-muted">
              Press Escape or tap close to dismiss
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
