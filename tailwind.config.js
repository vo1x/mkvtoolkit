/** @type {import('tailwindcss').Config} */
import withMT from '@material-tailwind/react/utils/withMT';

export default withMT({
  content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neutral-50': 'oklch(0.985 0 0)', // Background color for bg-neutral-50
        'neutral-100': 'oklch(0.97 0 0)', // Background color for bg-neutral-100
        'neutral-200': 'oklch(0.922 0 0)', // Background color for bg-neutral-200
        'neutral-300': 'oklch(0.87 0 0)', // Background color for bg-neutral-300
        'neutral-400': 'oklch(0.708 0 0)', // Background color for bg-neutral-400
        'neutral-500': 'oklch(0.556 0 0)', // Background color for bg-neutral-500
        'neutral-600': 'oklch(0.439 0 0)', // Background color for bg-neutral-600
        'neutral-700': 'oklch(0.371 0 0)', // Background color for bg-neutral-700
        'neutral-800': 'oklch(0.269 0 0)', // Background color for bg-neutral-800
        'neutral-900': 'oklch(0.205 0 0)', // Background color for bg-neutral-900
        'neutral-950': 'oklch(0.145 0 0)',
        'blue-50': 'oklch(0.985 0.1 0.2)', // Example oklch value for blue-50
        'blue-100': 'oklch(0.97 0.1 0.2)', // Example oklch value for blue-100
        'blue-200': 'oklch(0.922 0.1 0.3)', // Example oklch value for blue-200
        'blue-300': 'oklch(0.87 0.1 0.4)', // Example oklch value for blue-300
        'blue-400': 'oklch(0.708 0.1 0.5)', // Example oklch value for blue-400
        'blue-500': 'oklch(0.556 0.1 0.6)', // Example oklch value for blue-500
        'blue-600': 'oklch(0.439 0.1 0.7)', // Example oklch value for blue-600
        'blue-700': 'oklch(0.371 0.1 0.8)', // Example oklch value for blue-700
        'blue-800': 'oklch(0.269 0.1 0.9)', // Example oklch value for blue-800
        'blue-900': 'oklch(0.205 0.1 1.0)', // Example oklch value for blue-900
        'blue-950': 'oklch(0.145 0.1 1.1)' // Example oklch value for blue-950 // Background color for bg-neutral-950
      }
    }
  },
  variants: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: []
});
