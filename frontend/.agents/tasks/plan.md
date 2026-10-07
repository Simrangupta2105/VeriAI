# Implementation Plan: VeriAI Frontend Theme Redesign
## Light Theme Overhaul (Styling Only)

This plan outlines a complete visual redesign from dark slate-950 theme to a professional light theme inspired by TextSight AI. **No logic, backend changes, or functionality removal.** Only styling and layout.

---

## Design Decisions

1. **Color Palette**: Use light backgrounds (#f8f9fa, #ffffff, #f0f1f3), dark text (#1a1a1a, #374151), blue accent (#2563eb or #3b82f6). Status colors: green for verified, yellow for questionable, orange for unsupported, red for contradicted.
   - *Rationale*: TextSight shows a minimal, airy interface with generous whitespace and professional typography. Light mode is more readable and modern for verification tools.

2. **Typography & Spacing**: Increase whitespace, make hierarchy clearer (larger headings, smaller secondary text), remove heavy shadows and gradients.
   - *Rationale*: Professional SaaS design emphasizes clarity over decoration. Reduces cognitive load for fact-checking workflows.

3. **Component Structure**: Preserve all existing markup; only update classNames. Add new elements only for new visual indicators (word count display, reliability badges) that were missing.
   - *Rationale*: Minimizes risk of breaking functionality and keeps logic intact.

4. **Status Indicators**: Replace dark color-coded badges with light backgrounds + borders + icons. Contradicted claims get a light red background, supported get light green, etc.
   - *Rationale*: Matches TextSight's clear, scannable status system and maintains accessibility.

---

## Implementation Order

**Phase 1: Global Styles & Layout**
- [ ] 1. Add light theme CSS custom properties and reset base styles in App.css
      Files: `src/App.css`
      Verify: `npm run dev` — check in browser at localhost that CSS loads without errors

- [ ] 2. Update App.jsx root className: change from `bg-slate-950 text-slate-100` to light theme with `bg-white` / `bg-slate-50`, `text-slate-900` / `text-gray-700`
      Files: `src/App.jsx`
      Verify: `npm run dev` — page background is now light, text is dark

**Phase 2: Navigation & Header**
- [ ] 3. Redesign Navbar.jsx: light background (`bg-white`), light borders, blue accent for active tab, remove dark gradients
      Files: `src/components/Navbar.jsx`
      Verify: `npm run dev` — navbar is light, tabs use blue highlight instead of cyan

**Phase 3: Input & Configuration Area**
- [ ] 4. Redesign QuestionInput.jsx: light textarea with light borders, blue button instead of cyan-indigo gradient, add word count display (if not already present)
      Files: `src/components/QuestionInput.jsx`
      Verify: `npm run dev` — textarea and button match light theme, word count shows

- [ ] 5. Redesign ProviderSelector.jsx: light cards with light borders, blue checkmark highlight, remove dark backgrounds
      Files: `src/components/ProviderSelector.jsx`
      Verify: `npm run dev` — provider cards are light and readable

- [ ] 6. Redesign ModeSelector.jsx: light cards with light borders, blue highlight for active mode
      Files: `src/components/ModeSelector.jsx`
      Verify: `npm run dev` — mode selector matches light theme

**Phase 4: Results Display**
- [ ] 7. Redesign SynthesizedAnswerCard.jsx: light background, improve reliability/confidence badge display with status colors (green for HIGH, yellow for MEDIUM, red for LOW), add visual progress bar with light colors
      Files: `src/components/SynthesizedAnswerCard.jsx`
      Verify: `npm run dev` — answer card displays with clear status colors and readable text

- [ ] 8. Redesign ClaimExplorer.jsx: light cards for each claim, status badges use green/yellow/orange/red backgrounds (light), expand/collapse still works
      Files: `src/components/ClaimExplorer.jsx`
      Verify: `npm run dev` — claims display with proper light status colors, click to expand/collapse works

- [ ] 9. Redesign SourceList.jsx: light cards, light borders, clickable links styled in blue
      Files: `src/components/SourceList.jsx`
      Verify: `npm run dev` — sources display readably with light background

- [ ] 10. Redesign ModelResponseCard.jsx: light background, light tabs for model selection, light text area for response
      Files: `src/components/ModelResponseCard.jsx`
      Verify: `npm run dev` — model responses are readable in light theme

- [ ] 11. Redesign PipelineStepper.jsx: light background, light icons, horizontal pipeline display readable
      Files: `src/components/PipelineStepper.jsx`
      Verify: `npm run dev` — pipeline stages display clearly

**Phase 5: Modals & Secondary Views**
- [ ] 12. Redesign ApiKeyModal.jsx: light background, light inputs, light borders, blue buttons
      Files: `src/components/ApiKeyModal.jsx`
      Verify: `npm run dev` — open API key modal (click BYOK Keys button), verify light styling

- [ ] 13. Redesign DocumentVerificationView.jsx: light cards, light upload area, light text inputs
      Files: `src/components/DocumentVerificationView.jsx`
      Verify: `npm run dev` — switch to Doc Grounding tab, verify light theme

- [ ] 14. Redesign EvaluationView.jsx: light background, light metric cards, light table, readable text
      Files: `src/components/EvaluationView.jsx`
      Verify: `npm run dev` — switch to Academic Benchmark tab, verify light theme

**Phase 6: Final Polish**
- [ ] 15. Review footer styling, error messages, and all edge cases; ensure consistency across theme
      Files: `src/App.jsx` (footer), all component error message backgrounds
      Verify: `npm run dev` — trigger an error (invalid API key test) and verify error styling is light; footer is readable

- [ ] 16. Full end-to-end verification: run `npm run dev`, test all tabs, all interactive elements, verify no console errors
      Verify: `npm run dev` — open http://localhost:5173 (or specified port), navigate all tabs, test input, button clicks, modals, expand/collapse; confirm all text is readable and no UI is broken

---

## Color Mapping Reference

This is the translation from old dark theme to new light theme:

| Old (Dark) | New (Light) | Purpose |
|-----------|-----------|---------|
| `bg-slate-950`, `bg-slate-900` | `bg-white`, `bg-slate-50`, `bg-gray-50` | Main backgrounds |
| `text-slate-100`, `text-white` | `text-slate-900`, `text-gray-800`, `text-gray-700` | Main text |
| `border-slate-800`, `border-slate-700` | `border-gray-200`, `border-gray-300` | Borders |
| `bg-cyan-500` (accent) | `bg-blue-500` (accent) | Primary buttons & highlights |
| `bg-emerald-950`, `text-emerald-300` | `bg-green-50`, `text-green-700`, `border-green-200` | Supported/verified status |
| `bg-rose-950`, `text-rose-300` | `bg-red-50`, `text-red-700`, `border-red-200` | Contradicted/error status |
| `bg-amber-950`, `text-amber-300` | `bg-yellow-50`, `text-yellow-700`, `border-yellow-200` | Uncertain/warning status |
| `bg-slate-800` (secondary) | `bg-gray-100` (secondary) | Secondary backgrounds, disabled states |
| Remove: gradients, shadows | Add: subtle borders, clear spacing | Visual hierarchy |

---

## Specific Styling Changes by Component

### Navbar.jsx
- Change `bg-slate-950/80` → `bg-white`
- Change `border-slate-800` → `border-gray-200`
- Change active tab from `bg-slate-800 text-cyan-400 border-slate-700` → `bg-blue-50 text-blue-600 border-blue-300`
- Logo gradient stays (or becomes blue theme)
- Inactive tabs: `text-slate-400 hover:text-slate-200` → `text-gray-500 hover:text-gray-700`

### QuestionInput.jsx
- Textarea: `bg-slate-900/70 border-slate-700/80` → `bg-white border-gray-300`
- Textarea placeholder: `placeholder-slate-500` → `placeholder-gray-400`
- Textarea text: `text-slate-100` → `text-slate-900`
- Button: `from-cyan-500 to-indigo-600` → `bg-blue-600 hover:bg-blue-700`
- Sample queries: `bg-slate-900 hover:bg-slate-800` → `bg-gray-100 hover:bg-gray-200`

### ProviderSelector.jsx
- Cards: `bg-slate-950/60 border-slate-800/80` → `bg-white border-gray-200`
- Active card: `bg-slate-900/90 border-slate-600 ring-cyan-500/30` → `bg-blue-50 border-blue-400 ring-blue-300`
- Checkmark: keep but make blue instead of cyan
- "Demo Sim" badge: `bg-slate-800 text-slate-400` → `bg-gray-100 text-gray-600`
- "BYOK Live" badge: keep green

### ModeSelector.jsx
- Cards: `bg-slate-950/60 border-slate-800` → `bg-white border-gray-200`
- Active card: `bg-slate-900 border-cyan-500/80` → `bg-blue-50 border-blue-400`
- Icon background: `bg-cyan-500/20 text-cyan-400` → `bg-blue-100 text-blue-600`

### SynthesizedAnswerCard.jsx
- Main container: `from-slate-900 via-slate-900/95 to-slate-950` → `bg-white`
- Border: `border-slate-700/80` → `border-gray-200`
- Header: `border-slate-800` → `border-gray-200`
- Confidence badge colors:
  - HIGH: `bg-emerald-950/80 text-emerald-300` → `bg-green-50 text-green-700 border-green-200`
  - MEDIUM: `bg-cyan-950/80 text-cyan-300` → `bg-blue-50 text-blue-700 border-blue-200`
  - LOW: `bg-rose-950/80 text-rose-300` → `bg-red-50 text-red-700 border-red-200`
- Progress bar background: `bg-slate-800` → `bg-gray-200`
- Support ratio bar: keep green
- Contradiction bar: keep red
- Uncertain bar: keep orange

### ClaimExplorer.jsx
- Container: `border-slate-800 bg-slate-900/50` → `border-gray-200 bg-white`
- Claim card (default): `border-slate-800/90 bg-slate-950/50` → `border-gray-200 bg-gray-50`
- Claim card (contradicted): `border-rose-900/60 bg-rose-950/10` → `border-red-200 bg-red-50`
- Status badges:
  - SUPPORTED: `bg-emerald-950/80 text-emerald-300` → `bg-green-50 text-green-700 border-green-200`
  - CONTRADICTED: `bg-rose-950/80 text-rose-300` → `bg-red-50 text-red-700 border-red-200`
  - UNCERTAIN: `bg-amber-950/80 text-amber-300` → `bg-yellow-50 text-yellow-700 border-yellow-200`
- Expanded detail: `bg-slate-900/40 border-slate-800/80` → `bg-gray-100 border-gray-200`

### SourceList.jsx
- Container: `border-slate-800 bg-slate-900/50` → `border-gray-200 bg-white`
- Source cards: `border-slate-800 bg-slate-950/60` → `border-gray-200 bg-gray-50`
- Authority score badge: keep blue/cyan styling (becomes `bg-blue-50 text-blue-600`)

### ModelResponseCard.jsx
- Container: `border-slate-800 bg-slate-900/50` → `border-gray-200 bg-white`
- Header: `bg-slate-900/80 border-slate-800` → `bg-gray-100 border-gray-200`
- Tab buttons (active): `bg-cyan-500/20 text-cyan-300 border-cyan-500/50` → `bg-blue-100 text-blue-600 border-blue-300`
- Response text: `text-slate-300` → `text-slate-900`

### ApiKeyModal.jsx
- Background: `bg-slate-900 border-slate-800` → `bg-white border-gray-200`
- Input: `bg-slate-900 border-slate-700/80` → `bg-white border-gray-300`
- Input focus: `focus-border-cyan-500` → `focus-border-blue-500`
- Provider card: `bg-slate-950/60 p-3 rounded-xl border-slate-800` → `bg-gray-50 p-3 rounded-xl border-gray-200`
- Buttons: cyan/blue updates

### DocumentVerificationView.jsx
- Container: `border-slate-800 bg-slate-900/60` → `border-gray-200 bg-white`
- Dropzone: `border-slate-700/80 hover-border-cyan-500/60 bg-slate-950/40` → `border-gray-300 hover-border-blue-400 bg-white`
- Input: `bg-slate-950 border-slate-700` → `bg-white border-gray-300`
- Result container: `border-slate-800 bg-slate-900/50` → `border-gray-200 bg-white`

### EvaluationView.jsx
- Header card: `from-slate-900 to-slate-950` → `bg-white`
- Metric cards: `border-slate-800 bg-slate-900/60` → `border-gray-200 bg-gray-50`
- Table: `divide-slate-800/60` → `divide-gray-200`
- Table header: `border-slate-800 text-slate-400` → `border-gray-300 text-gray-600`
- Comparison table row (VeriAI): `bg-cyan-950/20` → `bg-blue-50`

### PipelineStepper.jsx
- Container: `border-slate-800 bg-slate-900/40` → `border-gray-200 bg-gray-50`
- Stage boxes: `bg-slate-900/80 border-slate-800` → `bg-white border-gray-200`
- Duration badge: `bg-cyan-950/60 border-cyan-800/50` → `bg-blue-50 text-blue-600 border-blue-200`

### App.jsx (main container and footer)
- Main: `bg-slate-950 text-slate-100` → `bg-white text-slate-900`
- Mission banner: `from-slate-900/90 via-slate-900/50 to-slate-950 border-slate-800/80` → `from-white via-gray-50 to-white border-gray-200`
- Mission banner text: `text-white` → `text-slate-900`, `text-slate-400` → `text-gray-600`
- Interactive config section: `border-slate-800 bg-slate-900/40` → `border-gray-200 bg-gray-50`
- Error banner: `bg-rose-950/40 border-rose-800/80` → `bg-red-50 border-red-200 text-red-700`
- Export/Reset buttons: update to light styling
- Footer: `border-slate-900 bg-slate-950/60 text-slate-500` → `border-gray-200 bg-gray-50 text-gray-600`

---

## Additional Markup Updates

1. **Word Count Display** (QuestionInput.jsx): If not present, add a word/character counter display near the textarea submit button area in light gray text.

2. **Reliability Score Badge** (SynthesizedAnswerCard.jsx): Ensure the confidence badge prominently shows HIGH/MEDIUM/LOW with clear color coding.

3. **Claim Status Indicators** (ClaimExplorer.jsx): Each claim should have a clear colored badge (green/yellow/orange/red) matching its verification_status.

4. **Source Authority Badges** (SourceList.jsx & ClaimExplorer.jsx): Authority scores should display in blue badges.

---

## Verification Checklist

After completing all edits:

1. Run `npm run dev` and verify:
   - Page loads without console errors
   - All text is readable (dark text on light backgrounds)
   - All interactive elements (buttons, tabs, expand/collapse) work
   - Colors match the mapping above

2. Test each tab:
   - Research Studio: submit query, view results, all sections visible
   - Doc Grounding: upload interface visible, file picker works
   - Academic Benchmark: table and metric cards display

3. Test interactivity:
   - Click provider checkboxes — should toggle
   - Click mode selector — should highlight active mode
   - Click claim cards to expand/collapse — should work
   - Click model response tabs — should switch views
   - Click "BYOK Keys" button — modal opens with light styling
   - Click export button — should not break

4. Visual polish:
   - No orphaned dark colors
   - Consistent spacing and alignment
   - Blue accent used consistently for highlights
   - Status colors (green/yellow/red) applied consistently

---

## Notes

- **No component restructuring**: All existing JSX structure remains; only className updates.
- **No logic changes**: Business logic, state management, API calls untouched.
- **Gradients removal**: Dark gradient backgrounds replaced with flat light colors or subtle borders.
- **Icon colors**: Lucide icons automatically inherit color from parent text/container classes.
- **Hover states**: Update from dark theme hover (lighter dark) to light theme hover (darker light).
- **Selection**: Keep `selection:bg-blue-500 selection:text-white` in App.jsx root.
- **Tailwind classes only**: No new CSS files or custom styles; work entirely within Tailwind utility classes.

---

## Build & Test Commands

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint**: `npm run lint`
- **Preview built output**: `npm run preview`

---

End of Plan
