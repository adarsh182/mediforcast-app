module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'severity-low': '#10b981',
        'severity-medium': '#f59e0b',
        'severity-high': '#ef4444',
        'severity-emergency': '#7c3aed',
      }
    },
  },
  plugins: [],
}
