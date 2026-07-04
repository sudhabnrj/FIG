/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        body: "var(--bg-body)",
        cardBg: "var(--bg-card)",
        navbar: "var(--bg-navbar)",
        sidebar: "var(--bg-sidebar)",
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        lavender: "var(--color-lavender)",
        success: "var(--color-success)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "border-light": "var(--border-light)",
        "border-custom": "var(--border-color)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 4px 18px -4px rgba(148, 163, 184, 0.12)",
        hover: "0 10px 25px -5px rgba(99, 102, 241, 0.15)",
        sidebar: "0 4px 20px -2px rgba(148, 163, 184, 0.08)",
      }
    },
  },
  plugins: [],
}
