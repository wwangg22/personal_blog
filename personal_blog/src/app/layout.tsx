import type { Metadata } from "next";
import Script from "next/script";          // ⬅️  Next.js helper for inline scripts
import "./globals.css";
// import "./build.css";

export const metadata: Metadata = {
  title: "William's Personal Blog",
  description: "Some Projects and Thoughts",
};

/**
 * Inline JS that:
 * 1. Checks localStorage for a saved choice ("dark" | "light").
 * 2. If none, falls back to prefers-color-scheme.
 * 3. Adds .dark to <html> early so Tailwind’s dark: utilities activate immediately.
 */
const themeInit = `
(() => {
  try {
    const stored = localStorage.getItem("theme");           // "dark" | "light" | null
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = stored === "dark" || (stored === null && prefers);
    if (useDark) document.documentElement.classList.add("dark");
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Tell browsers we support both themes for built-in UI (scrollbars, etc.) */}
        <meta name="color-scheme" content="light dark" />

        {/* Run *before* React hydrates; avoids colour flash */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
      </head>

      {/* Default palette; Tailwind will swap on .dark */}
      <body>
        {children}
      </body>
    </html>
  );
}
