"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, BarChart3, Bell, Bot, ChevronLeft, CircleDot, ClipboardCheck,
  Compass, GitBranch, Globe2, GraduationCap, LayoutDashboard, Search,
  Shield, Users,
} from "lucide-react";
import { Copilot } from "@/components/Copilot";
import { CommandPalette } from "@/components/CommandPalette";

const NAV = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/talent", label: "Talent Match", icon: Users },
  { href: "/skills", label: "Skill Intelligence", icon: GraduationCap },
  { href: "/strategy", label: "Strategy Room", icon: Compass },
  { href: "/actions", label: "Actions", icon: ClipboardCheck },
  { href: "/decisions", label: "Decisions", icon: GitBranch },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/markets", label: "Markets", icon: Globe2 },
];

export interface SystemStatus {
  gemini: string;
  models: { reasoning: string; fast: string; embedding: string };
  retrieval: { store: string; mode?: string; chunks?: number; vectors?: number };
  knowledgeBase: number;
  candidates: number;
  requirements: number;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") { e.preventDefault(); setCopilotOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const live = status?.gemini === "connected";

  return (
    <div className="relative min-h-screen">
      <div className="app-bg" />
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 68 : 244 }}
          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
          className="sticky top-0 h-screen shrink-0 border-r border-line-soft bg-[rgba(10,12,14,0.72)] backdrop-blur-xl flex flex-col"
        >
          <div className="flex items-center gap-2.5 px-4 h-16 border-b border-line-soft">
            <div className="grid place-items-center w-8 h-8 rounded-[10px] bg-gradient-to-b from-[#eab959] to-[#c68f33] text-[#20170a] font-bold text-[13px] shrink-0">A</div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[13px] font-semibold tracking-[-0.01em] truncate">AMBE INTELLIGENCE</div>
                <div className="text-[10px] text-faint truncate">Workforce & Executive OS</div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto scroll-thin py-3 px-2.5 space-y-0.5">
            {NAV.map((n) => {
              const active = path === n.href;
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors ${
                    active ? "bg-[rgba(226,172,79,0.09)] text-accent" : "text-muted hover:text-fg hover:bg-surface-2"
                  }`}
                  title={collapsed ? n.label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="truncate">{n.label}</span>}
                  {active && !collapsed && <CircleDot size={10} className="ml-auto opacity-70" />}
                </Link>
              );
            })}

            <div className="my-3 border-t border-line-soft" />
            <button
              onClick={() => setCopilotOpen(true)}
              className="w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-muted hover:text-fg hover:bg-surface-2 transition-colors"
              title="AI Copilot"
            >
              <Bot size={16} className="shrink-0" />
              {!collapsed && <span>AI Copilot</span>}
              {!collapsed && <kbd className="ml-auto text-[9.5px] text-faint border border-line rounded px-1 py-0.5">⌘J</kbd>}
            </button>
            <div className="my-3 border-t border-line-soft" />
            <Link
              href="/responsible-ai"
              className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors ${
                path === "/responsible-ai" ? "bg-[rgba(226,172,79,0.09)] text-accent" : "text-muted hover:text-fg hover:bg-surface-2"
              }`}
              title="Responsible AI & Settings"
            >
              <Shield size={16} className="shrink-0" />
              {!collapsed && <span>Responsible AI</span>}
            </Link>
          </nav>

          <div className="px-3 py-3 border-t border-line-soft">
            {!collapsed && (
              <div className="text-[10px] text-faint leading-relaxed mb-2">
                Strategic AI Prototype
                <br />Concept Demonstration
              </div>
            )}
            <button onClick={() => setCollapsed((v) => !v)} className="btn btn-ghost w-full justify-center !px-0 !py-1.5">
              <ChevronLeft size={14} className={collapsed ? "rotate-180" : ""} />
            </button>
          </div>
        </motion.aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 h-16 border-b border-line-soft bg-[rgba(10,12,14,0.72)] backdrop-blur-xl flex items-center gap-3 px-5">
            <button onClick={() => setPaletteOpen(true)} className="flex items-center gap-2 rounded-[10px] border border-line-soft bg-surface px-3 py-1.5 text-[12.5px] text-faint hover:border-line transition-colors w-64 max-w-[40vw]">
              <Search size={13} />
              <span className="truncate">Search or run a command</span>
              <kbd className="ml-auto text-[9.5px] border border-line rounded px-1 py-0.5">⌘K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setStatusOpen((v) => !v)} className="chip hover:border-line transition-colors" title="System status">
                <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-ok" : "bg-warn"}`} />
                {live ? "Gemini connected" : "Demo mode"}
              </button>
              <button className="btn btn-ghost !px-2" title="Notifications">
                <span className="relative">
                  <Bell size={16} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
                </span>
              </button>
              <div className="grid place-items-center w-8 h-8 rounded-full border border-line bg-surface-2 text-[11px] font-semibold tracking-wide">VJ</div>
            </div>
          </header>

          <AnimatePresence>
            {statusOpen && status && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="fixed right-5 top-[68px] z-40 w-[320px] card p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-accent" />
                  <span className="text-[13px] font-semibold">System status</span>
                </div>
                <Row k="Gemini API" v={live ? "Connected" : "Demo intelligence"} tone={live ? "ok" : "warn"} />
                <Row k="Reasoning model" v={status.models.reasoning} />
                <Row k="Fast model" v={status.models.fast} />
                <Row k="Embeddings" v={status.retrieval.mode === "gemini" ? status.models.embedding : "lexical fallback"} />
                <Row k="Vector store" v={status.retrieval.store} />
                <Row k="Knowledge base" v={`${status.knowledgeBase} documents · ${status.retrieval.chunks ?? 0} chunks`} />
                <Row k="Candidates indexed" v={`${status.retrieval.vectors ?? status.candidates}`} />
                <Row k="Active requirements" v={`${status.requirements} demo requirements`} />
                <p className="text-[10.5px] text-faint mt-3 leading-relaxed">
                  All figures in this application are illustrative prototype data, not Ambe International operating data.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="px-5 md:px-7 py-6 max-w-[1500px]">{children}</main>

          <footer className="px-7 py-6 border-t border-line-soft text-[11px] text-faint flex flex-wrap gap-x-6 gap-y-1 justify-between">
            <span>AMBE INTELLIGENCE · From skills to opportunity. From decisions to execution.</span>
            <span>Strategic AI Prototype — Concept Demonstration · Not an official Ambe International product</span>
          </footer>
        </div>
      </div>

      {/* Floating copilot launcher */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full pl-3.5 pr-4 py-2.5 text-[13px] font-medium text-[#20170a] bg-gradient-to-b from-[#eab959] to-[#d29a3c] shadow-[0_10px_30px_-10px_rgba(226,172,79,0.6)] hover:brightness-105 transition"
      >
        <Bot size={16} /> Ask Ambe Intelligence
      </button>

      <Copilot open={copilotOpen} onClose={() => setCopilotOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onCopilot={() => { setPaletteOpen(false); setCopilotOpen(true); }} />
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "ok" | "warn" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-line-soft last:border-0">
      <span className="text-[11.5px] text-faint">{k}</span>
      <span className={`text-[11.5px] truncate ${tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-fg"}`}>{v}</span>
    </div>
  );
}
