/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 奶油底色
        cream: {
          50: '#FDFAF4',
          100: '#FBF7EC',
          200: '#F4ECD8',
          300: '#EBDEBE',
        },
        // 深棕文字
        cacao: {
          400: '#6B5642',
          500: '#4A3A2A',
          600: '#3A2D20',
          700: '#2B2018',
          800: '#1E1610',
        },
        // 橄榄绿主调
        olive: {
          50: '#F2F5EC',
          100: '#E1E9CF',
          200: '#C7D4A4',
          300: '#A5BC79',
          400: '#859E54',
          500: '#6B8540',
          600: '#566933',
          700: '#43512A',
          800: '#323E1F',
        },
        // 南瓜橙强调
        pumpkin: {
          50: '#FDF1E6',
          100: '#FAE0C5',
          200: '#F4B988',
          300: '#EE9A57',
          400: '#E8833A',
          500: '#D26920',
          600: '#A9541B',
        },
        // 番茄红警示
        tomato: {
          400: '#D86A5A',
          500: '#C8553D',
          600: '#A23B27',
        },
        // 雾蓝信息
        skyhaze: {
          400: '#7B9AAE',
          500: '#5A7A8C',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl2': '1.25rem',
        '2xl2': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 16px -4px rgba(74, 58, 42, 0.08), 0 2px 6px -2px rgba(74, 58, 42, 0.06)',
        'card': '0 8px 30px -8px rgba(74, 58, 42, 0.12), 0 2px 8px -4px rgba(74, 58, 42, 0.08)',
        'lift': '0 16px 40px -12px rgba(74, 58, 42, 0.22), 0 4px 12px -4px rgba(74, 58, 42, 0.10)',
      },
      backgroundImage: {
        'paper': "radial-gradient(circle at 12% 18%, rgba(232,131,58,0.06) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(107,133,64,0.07) 0%, transparent 45%), linear-gradient(180deg, #FDFAF4 0%, #FBF7EC 100%)",
        'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.10 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '60%': { opacity: '1', transform: 'scale(1.01)' },
          '100%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 1.8s linear infinite',
      }
    },
  },
  plugins: [],
}
