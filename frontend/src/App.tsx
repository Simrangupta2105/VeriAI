import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './hooks/useTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy-loaded route views
const Landing = lazy(() => import('./pages/Landing'));
const Checker = lazy(() => import('./pages/Checker'));
const Audits = lazy(() => import('./pages/Audits'));
const AuditDetail = lazy(() => import('./pages/AuditDetail'));
const About = lazy(() => import('./pages/About'));
const StyleGuide = lazy(() => import('./pages/StyleGuide'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg">Loading VeriAI...</span>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/check" element={<Checker />} />
              <Route path="/audits" element={<Audits />} />
              <Route path="/audits/:id" element={<AuditDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
