import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "PairWise — Let your agents meet before you do",
  description:
    "An agentic matchmaking platform where consenting participants are represented by AI agents that analyze permitted LinkedIn and Instagram sources, simulate dating conversations, and produce explainable compatibility rankings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary-soft selection:text-primary">
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1 py-8 sm:py-10">
            <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
              {children}
            </div>
          </main>
          <footer className="border-t border-border bg-surface py-6 text-center text-xs text-muted">
            <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
              <p>
                PairWise — Consented Agentic Matchmaking MVP. Interpretations are exploratory estimates.
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-muted">
                <span>Two Source Provenance</span>
                <span>•</span>
                <span>Zero Unauthorized Scraping</span>
                <span>•</span>
                <span>Explicit Consent Gate</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
