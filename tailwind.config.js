/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    './modules/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        chart: { '1':'hsl(var(--chart-1))','2':'hsl(var(--chart-2))','3':'hsl(var(--chart-3))','4':'hsl(var(--chart-4))','5':'hsl(var(--chart-5))' },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Brand civic-tech palette
        brand: {
          50:'#eef4ff',100:'#dbe7ff',200:'#b6cfff',300:'#86b1ff',400:'#5b8eff',
          500:'#3a6bff',600:'#274de8',700:'#1f3bbf',800:'#1c328f',900:'#152360'
        },
        aurora: { violet:'#7c3aed', cyan:'#22d3ee', mint:'#34d399', amber:'#fbbf24', rose:'#f43f5e' }
      },
      borderRadius: { lg:'var(--radius)', md:'calc(var(--radius) - 2px)', sm:'calc(var(--radius) - 4px)', xl:'calc(var(--radius) + 4px)' },
      keyframes: {
        'accordion-down': { from:{height:'0'}, to:{height:'var(--radix-accordion-content-height)'} },
        'accordion-up':   { from:{height:'var(--radix-accordion-content-height)'}, to:{height:'0'} },
        'aurora': { '0%,100%':{transform:'translate(0,0) scale(1)'}, '50%':{transform:'translate(40px,-30px) scale(1.15)'} },
        'float': { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-6px)'} },
        'shimmer': { '0%':{backgroundPosition:'-1000px 0'}, '100%':{backgroundPosition:'1000px 0'} },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'aurora': 'aurora 18s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
