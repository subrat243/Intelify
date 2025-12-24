import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark SOC theme colors
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                // Threat severity colors
                critical: "#dc2626", // red-600
                high: "#ea580c", // orange-600
                medium: "#f59e0b", // amber-500
                low: "#10b981", // emerald-500
                info: "#3b82f6", // blue-500
                // SOC specific colors
                'soc-bg': '#0a0e1a',
                'soc-card': '#111827',
                'soc-border': '#1f2937',
                'soc-accent': '#3b82f6',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [],
};

export default config;
