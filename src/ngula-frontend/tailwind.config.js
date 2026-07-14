/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — refined Ngula gold/amber (derived from logo #d4a843)
        brand: {
          50: '#fdf9ef',
          100: '#faf0d6',
          200: '#f4dfa8',
          300: '#edc86f',
          400: '#e3ad3f',
          500: '#d4a843', // primary
          600: '#b8862b',
          700: '#946722',
          800: '#795321',
          900: '#67461f',
        },
        // Neutral charcoal/grey scale (Vercel-like)
        ink: {
          50: '#f7f8f9',
          100: '#eceef1',
          200: '#dfe2e7',
          300: '#c3c9d1',
          400: '#9aa2ae',
          500: '#6b7280',
          600: '#4b515c',
          700: '#363b44',
          800: '#22262d',
          900: '#111318',
        },
        success: { DEFAULT: '#16a34a', soft: '#dcfce7', ink: '#166534' },
        warning: { DEFAULT: '#d97706', soft: '#fef3c7', ink: '#92400e' },
        danger: { DEFAULT: '#dc2626', soft: '#fee2e2', ink: '#991b1b' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        'card-hover': '0 4px 12px rgba(16,24,40,0.08), 0 2px 4px rgba(16,24,40,0.04)',
        pop: '0 8px 28px rgba(16,24,40,0.12)',
        focus: '0 0 0 3px rgba(212,168,67,0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
      },
    },
  },
  plugins: [],
};
