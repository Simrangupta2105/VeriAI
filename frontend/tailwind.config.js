/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
        },
        rule: {
          DEFAULT: 'var(--color-rule)',
          strong: 'var(--color-rule-strong)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-muted)',
        },
        teal: {
          DEFAULT: 'var(--color-teal)',
          hover: 'var(--color-teal-hover)',
          surface: 'var(--color-teal-surface)',
        },
        ochre: {
          DEFAULT: 'var(--color-ochre)',
          surface: 'var(--color-ochre-surface)',
        },
        verdict: {
          supported: 'var(--color-verdict-supported)',
          'supported-surface': 'var(--color-verdict-supported-surface)',
          partial: 'var(--color-verdict-partial)',
          'partial-surface': 'var(--color-verdict-partial-surface)',
          unverified: 'var(--color-verdict-unverified)',
          'unverified-surface': 'var(--color-verdict-unverified-surface)',
          contra: 'var(--color-verdict-contra)',
          'contra-surface': 'var(--color-verdict-contra-surface)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        hairline: '0 1px 2px 0 rgba(20, 24, 31, 0.04)',
        elevation: '0 4px 12px 0 rgba(20, 24, 31, 0.06)',
      },
    },
  },
  plugins: [],
}
