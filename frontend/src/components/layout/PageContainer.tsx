import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { clsx } from 'clsx';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  hideFooter = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className={clsx('flex-1 w-full', className)}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

