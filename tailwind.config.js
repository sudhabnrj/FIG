/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        body: "#f7f9fc",
        cardBg: "#ffffff",
        primary: "#4f46e5",
        "primary-light": "#e0e7ff",
        accent: "#0284c7",
        "accent-light": "#e0f2fe",
        lavender: "#7c3aed",
        success: "#10b981",
        "text-primary": "#1e293b",
        "text-secondary": "#475569",
        "text-muted": "#64748b",
        "border-light": "#f1f5f9",
        "border-custom": "#e2e8f0",
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
