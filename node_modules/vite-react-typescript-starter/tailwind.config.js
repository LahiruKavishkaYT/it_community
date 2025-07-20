/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Custom breakpoints for specific use cases
      'tablet': '768px',
      'laptop': '1024px',
      'desktop': '1280px',
      // Height-based breakpoints
      'h-sm': { 'raw': '(max-height: 640px)' },
      'h-md': { 'raw': '(max-height: 768px)' },
      'h-lg': { 'raw': '(max-height: 1024px)' },
      // Touch device queries
      'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
      'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
    },
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xxs': '0.625rem',
        '2.5xl': '1.75rem',
        '3.5xl': '2rem',
        '4.5xl': '2.5rem',
      },
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      colors: {
        gray: {
          750: '#374155',
          850: '#1e293b',
          950: '#0f172a',
        },
        blue: {
          450: '#60a5fa',
          550: '#3b82f6',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [
    // Custom plugin for mobile-first utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Touch-friendly button sizes
        '.btn-touch': {
          minHeight: '44px',
          minWidth: '44px',
          padding: theme('spacing.3'),
        },
        '.btn-touch-sm': {
          minHeight: '36px',
          minWidth: '36px',
          padding: theme('spacing.2'),
        },
        '.btn-touch-lg': {
          minHeight: '56px',
          minWidth: '56px',
          padding: theme('spacing.4'),
        },
        // Safe area utilities for mobile devices
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        // Responsive text utilities
        '.text-responsive': {
          fontSize: '14px',
          '@media (min-width: 640px)': {
            fontSize: '16px',
          },
          '@media (min-width: 1024px)': {
            fontSize: '18px',
          },
        },
        '.text-responsive-sm': {
          fontSize: '12px',
          '@media (min-width: 640px)': {
            fontSize: '14px',
          },
          '@media (min-width: 1024px)': {
            fontSize: '16px',
          },
        },
        // Mobile-optimized spacing
        '.space-mobile': {
          margin: theme('spacing.4'),
          '@media (min-width: 768px)': {
            margin: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            margin: theme('spacing.8'),
          },
        },
        '.gap-mobile': {
          gap: theme('spacing.4'),
          '@media (min-width: 768px)': {
            gap: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            gap: theme('spacing.8'),
          },
        },
        // Scroll optimizations
        '.scroll-smooth-touch': {
          scrollBehavior: 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Mobile grid utilities
        '.grid-mobile': {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: theme('spacing.4'),
          '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: theme('spacing.8'),
          },
        },
        '.grid-mobile-dense': {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: theme('spacing.3'),
          '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: theme('spacing.4'),
          },
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(3, 1fr)',
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: theme('spacing.6'),
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
