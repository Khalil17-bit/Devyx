import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  // In Next.js 15, route params is a Promise
  return <HomeContent params={params} />;
}

async function HomeContent({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="blueprint-container min-h-screen px-4 py-12 md:px-8">
      {/* Blueprint Crosshairs at top corners */}
      <span className="blueprint-crosshair top-0 left-0">+</span>
      <span className="blueprint-crosshair top-0 right-0">+</span>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-surface border border-border-grid font-mono text-xs uppercase tracking-technical text-accent-signal">
          <span className="w-2 h-2 rounded-none bg-accent-signal inline-block animate-pulse-signal" />
          DEVYX // ARCH_SYSTEM_ONLINE
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-text-primary">
          Deterministic Engineering & Workflow Automation
        </h1>

        <p className="font-sans text-lg md:text-xl text-text-secondary max-w-2xl">
          High-performance web architecture, cross-platform mobile apps, and autonomous n8n workflows built on zero-SSR caching and deterministic execution.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          <button className="btn-primary clip-chamfer px-7 py-3.5 bg-accent-primary text-bg-primary font-mono text-sm font-semibold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
            Initialize Pipeline
          </button>
          <button className="px-7 py-3.5 bg-bg-surface border border-border-grid text-text-primary font-mono text-sm font-semibold uppercase tracking-wider hover:border-accent-primary transition-colors">
            View Blueprint Specs
          </button>
        </div>

        {/* Diagnostic Palette Grid */}
        <div className="pt-12 border-t border-border-grid">
          <p className="font-mono text-xs uppercase tracking-technical text-text-muted mb-4">
            SYSTEM_DIAGNOSTICS // THEME_TOKENS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-bg-surface border border-border-grid">
              <span className="text-text-muted block text-[10px]">SURFACE</span>
              <span className="text-text-primary font-bold">bg-surface</span>
            </div>
            <div className="p-3 bg-bg-elevated border border-border-grid">
              <span className="text-text-muted block text-[10px]">ELEVATED</span>
              <span className="text-text-primary font-bold">bg-elevated</span>
            </div>
            <div className="p-3 bg-bg-surface border border-accent-primary">
              <span className="text-text-muted block text-[10px]">ACCENT</span>
              <span className="text-accent-primary font-bold">accent-primary</span>
            </div>
            <div className="p-3 bg-bg-surface border border-accent-signal">
              <span className="text-text-muted block text-[10px]">SIGNAL</span>
              <span className="text-accent-signal font-bold">accent-signal</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
