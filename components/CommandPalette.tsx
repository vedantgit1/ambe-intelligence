"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, CornerDownLeft, Search } from "lucide-react";

interface Cmd { label: string; hint: string; run: () => void; }

export function CommandPalette({ open, onClose, onCopilot }: { open: boolean; onClose: () => void; onCopilot: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);

  const commands: Cmd[] = useMemo(() => [
    { label: "Go to Overview", hint: "Landing", run: () => router.push("/") },
    { label: "Go to Command Center", hint: "Dashboard", run: () => router.push("/command-center") },
    { label: "Find Candidates", hint: "Talent Match", run: () => router.push("/talent") },
    { label: "Analyze Requirement", hint: "Talent Match", run: () => router.push("/talent?run=analyze") },
    { label: "Generate Executive Brief", hint: "Command Center", run: () => router.push("/command-center?run=brief") },
    { label: "View Strategy", hint: "Strategy Room", run: () => router.push("/strategy") },
    { label: "View Skill Intelligence", hint: "Skill-to-Opportunity", run: () => router.push("/skills") },
    { label: "View Analytics", hint: "Recruitment funnel", run: () => router.push("/analytics") },
    { label: "Add Action", hint: "Action tracker", run: () => router.push("/actions?new=1") },
    { label: "View Markets", hint: "GCC market intelligence", run: () => router.push("/markets") },
    { label: "View Decisions", hint: "Decision log", run: () => router.push("/decisions") },
    { label: "Responsible AI", hint: "Governance", run: () => router.push("/responsible-ai") },
    { label: "Ask AI", hint: "Chief of Staff copilot", run: onCopilot },
  ], [router, onCopilot]);

  const filtered = commands.filter((c) => (c.label + c.hint).toLowerCase().includes(q.toLowerCase()));

  useEffect(() => { setI(0); }, [q]);
  useEffect(() => { if (open) setQ(""); }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(x + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); const c = filtered[i]; if (c) { c.run(); onClose(); } }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, filtered, i, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-[14vh] z-50 w-[min(600px,92vw)] -translate-x-1/2 card p-0 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 h-13 py-3.5 border-b border-line-soft">
              <Search size={15} className="text-faint" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command…"
                className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-faint" />
              <kbd className="text-[9.5px] text-faint border border-line rounded px-1 py-0.5">ESC</kbd>
            </div>
            <div className="max-h-[46vh] overflow-y-auto scroll-thin py-1.5">
              {filtered.length === 0 && <p className="px-4 py-6 text-center text-[12.5px] text-faint">No matching command.</p>}
              {filtered.map((c, idx) => (
                <button key={c.label} onMouseEnter={() => setI(idx)} onClick={() => { c.run(); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === i ? "bg-surface-2" : ""}`}>
                  {c.label === "Ask AI" ? <Bot size={14} className="text-accent" /> : <CornerDownLeft size={13} className="text-faint" />}
                  <span className="text-[13px]">{c.label}</span>
                  <span className="ml-auto text-[11px] text-faint">{c.hint}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
