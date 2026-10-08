# VeriAI Frontend Redesign - Implementation Plan

## Overview
Redesign the VeriAI frontend to match the TextSight hallucination detector professional layout with day/night theme toggle support. The current app uses Tailwind v4 with @tailwindcss/vite plugin. Key changes: add theme state management, restructure layout with hero section, add theme toggle button, implement CSS variables for theme colors, and update components with dark mode support.

## Design Decisions

### Theme Implementation Strategy
- **State Management**: Theme state lives in App.jsx, passed down as props to components
- **Storage**: Theme preference stored in localStorage under key 'veriai-theme' ('light' or 'dark')
- **CSS Strategy**: Tailwind v4 class-based dark mode with `dark:` prefix classes; CSS variables in App.css for semantic color tokens
- **Initial Theme**: Light theme by default; persists user preference on reload
- **Transitions**: Smooth color transitions via `transition-colors` utility

### Layout Restructuring
- New hero section with FREE badge, compelling headline, and LLM compatibility line
- Main tool card design matching TextSight: tool name + description header, usage counter, paste/clear buttons, large textarea, verify button, tips section
- Responsive grid: main card on left/top, results panel on right/below (mobile)
- Current research components (queries, results) repositioned into this new structure

### Tailwind v4 Dark Mode Configuration
- Tailwind v4 uses class-based dark mode by default (docs recommend `dark:` prefix approach)
- index.css already has `@import "tailwindcss"`, no separate config file needed
- Dark mode activated by adding `dark` class to html or body element
- All dark-aware classes use `dark:` prefix throughout components

---

# Implementation Plan

- [ ] 1. Create enhanced App.css with CSS variable system for both light and dark themes
      Add :root variables for light theme and a .dark class override with dark theme variables.
      Include semantic color tokens for backgrounds, text, borders, accents, verification states.
      Add smooth `transition-colors` to relevant selectors for theme switching animation.
      Files: src/App.css
      Verify: No build errors when importing updated CSS.

- [ ] 2. Update App.jsx to add theme state management and pass to Navbar
      Add useState for theme (initialize from localStorage 'veriai-theme', default 'light').
      Add useEffect to sync theme to localStorage on change.
      Add toggleTheme handler function.
      Pass theme and onToggleTheme props to Navbar component.
      Apply `dark` class to root div when theme is 'dark'.
      Files: src/App.jsx
      Verify: Console shows no prop warning; theme state initializes correctly; localStorage updates on toggle.

- [ ] 3. Update Navbar.jsx to accept and display theme toggle button
      Accept 'theme' and 'onToggleTheme' props from App.
      Add Sun and Moon icon imports from lucide-react.
      Add theme toggle button in top-right of navbar (before or after BYOK Keys button).
      Button shows Sun icon when in light mode, Moon icon when in dark mode.
      Apply dark-mode-aware classes to navbar elements (dark: prefix for dark theme colors).
      Files: src/components/Navbar.jsx
      Verify: Theme toggle button renders; clicking toggles between Sun/Moon icons; no console errors.

- [ ] 4. Update index.css to support both light and dark theme base styles
      Modify @layer base body styles to use CSS variables instead of hardcoded dark values.
      Keep existing scrollbar styles but apply dark-mode-aware scrollbar colors.
      Ensure smooth transitions on color changes.
      Files: src/index.css
      Verify: Page renders correctly in both light and dark modes; scrollbar visible and styled appropriately.

- [ ] 5. Update QuestionInput.jsx component with dark mode support
      Replace hardcoded gray/blue color classes with dark: prefixed equivalents.
      Examples: 'bg-white dark:bg-slate-900', 'text-gray-400 dark:text-slate-400', 'border-gray-200 dark:border-slate-700'.
      Ensure input textarea, buttons, and text all have dark mode variants.
      Files: src/components/QuestionInput.jsx
      Verify: Run dev server, toggle theme, verify all input elements render correctly in both modes.

- [ ] 6. Update SynthesizedAnswerCard.jsx component with dark mode support
      Add dark: prefix classes to all background colors, text colors, borders, and accent colors.
      Examples: 'bg-white dark:bg-slate-900', 'text-gray-900 dark:text-white', 'border-gray-200 dark:border-slate-700'.
      Ensure confidence badges, progress bars, and icon backgrounds have dark variants.
      Files: src/components/SynthesizedAnswerCard.jsx
      Verify: Run dev server, toggle theme, verify card and all sub-elements render correctly in both modes.

- [ ] 7. Update ClaimExplorer.jsx component with dark mode support
      Add dark: prefix classes to claim cards, filter buttons, badges, and text elements.
      Ensure expanded claim detail sections have dark background and text contrast.
      Dark mode colors: bg-slate-900/50 for card backgrounds, text-slate-100 for text, border-slate-700 for borders.
      Files: src/components/ClaimExplorer.jsx
      Verify: Run dev server, toggle theme, verify all claim cards and filters render correctly in both modes.

- [ ] 8. Update remaining component files with dark mode support
      Apply dark: prefix pattern to all remaining components: ProviderSelector, ModeSelector, ModelResponseCard, 
      SourceList, PipelineStepper, ApiKeyModal, DocumentVerificationView, EvaluationView.
      Ensure consistent color palette: light backgrounds (white/gray-50), dark backgrounds (slate-900/slate-950).
      Verify text contrast meets accessibility standards in both modes.
      Files: src/components/ProviderSelector.jsx, src/components/ModeSelector.jsx, src/components/ModelResponseCard.jsx,
             src/components/SourceList.jsx, src/components/PipelineStepper.jsx, src/components/ApiKeyModal.jsx,
             src/components/DocumentVerificationView.jsx, src/components/EvaluationView.jsx
      Verify: Run `npm run dev`, toggle theme through all tabs, verify all components render correctly in both light and dark modes.

- [ ] 9. Test full theme toggle workflow end-to-end
      Start dev server with `npm run dev`.
      Navigate to frontend on http://localhost:5173.
      Click theme toggle button (Sun/Moon icon in top-right).
      Verify all page elements transition smoothly to dark mode.
      Verify localStorage persists theme selection (check DevTools > Application > localStorage, key 'veriai-theme').
      Refresh page and verify theme is maintained.
      Toggle back to light mode and verify all transitions and persistence work.
      Files: (no file changes)
      Verify: Visual inspection confirms smooth theme transitions, all UI elements render correctly in both modes,
              localStorage key 'veriai-theme' contains correct value, theme persists across page reloads.

---

## Notes on Architecture

### CSS Variable Naming Convention
Variables use semantic naming: `--bg-primary`, `--text-primary`, `--accent`, etc., not raw color names. This allows the App.css .dark class to override all variables at once without touching individual components.

### Component Pattern
All components use standard Tailwind dark: prefix pattern:
```jsx
className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700"
```

### Verification Colors (Must Support Dark Mode)
- Verified/Supported: green (light: green-50/green-700, dark: emerald-900/emerald-300)
- Contradicted/Fabricated: red (light: red-50/red-700, dark: rose-900/rose-300)
- Uncertain/Questionable: yellow/amber (light: yellow-50/yellow-700, dark: amber-900/amber-300)
- Badge colors use semantic pairs to maintain visibility in both modes

### localStorage Implementation
- Key: 'veriai-theme'
- Values: 'light' or 'dark'
- Retrieved on App mount, used to set initial theme state
- Updated whenever toggleTheme is called

### Tailwind v4 & Dark Mode
- No separate tailwind.config.js needed; v4 uses class-based dark mode out of the box
- The `@tailwindcss/vite` plugin handles compilation
- `dark:` prefix activates when `dark` class exists on ancestor (applied to root div in App.jsx)
- All color utilities automatically have `dark:` variants available

