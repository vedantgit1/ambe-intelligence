"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";

export function Card({ children, className = "", hover = false, delay = 0 }: { children: ReactNode; className?: string; hover?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.2, 0.7, 0.3, 1] }}
      className={`card ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
        {sub && <p className="text-[12.5px] text-faint mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="text-[13.5px] text-muted mt-1">{sub}</p>
      </div>
      {right}
    </div>
  );
}

const TONES: Record<string, string> = {
  neutral: "text-muted border-line",
  accent: "text-accent border-[#4a3a1c] bg-[rgba(226,172,79,0.07)]",
  ok: "text-ok border-[#1f3f2d] bg-[rgba(95,195,138,0.07)]",
  warn: "text-warn border-[#4a3a1c] bg-[rgba(223,166,63,0.07)]",
  danger: "text-danger border-[#4a2622] bg-[rgba(224,112,95,0.08)]",
  teal: "text-teal border-[#1c3f3a] bg-[rgba(79,195,174,0.07)]",
};

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: keyof typeof TONES | string; className?: string }) {
  return <span className={`chip ${TONES[tone] ?? TONES.neutral} ${className}`}>{children}</span>;
}

/** Counts up on first paint. Purely presentational — the value is the truth. */
export function Counter({ value, duration = 900 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n.toLocaleString()}</>;
}

export function Bar({ value, tone = "accent", height = 6 }: { value: number; tone?: "accent" | "teal" | "danger" | "ok"; height?: number }) {
  const color = { accent: "var(--color-accent)", teal: "var(--color-teal)", danger: "var(--color-danger)", ok: "var(--color-ok)" }[tone];
  return (
    <div className="w-full rounded-full bg-[#1b2025] overflow-hidden" style={{ height }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }}
        style={{ background: color, height: "100%" }}
      />
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/** Loading state that says what the system is actually doing at each step. */
export function AiThinking({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 1400);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[13px] text-accent">
        <Sparkles size={14} className="animate-pulse" />
        <motion.span key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>{steps[i]}</motion.span>
      </div>
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SourceTag({ source, note }: { source?: "gemini" | "demo"; note?: string }) {
  if (!source) return null;
  return source === "gemini" ? (
    <Badge tone="teal">Gemini reasoning</Badge>
  ) : (
    <Badge tone="warn" className="cursor-help"><AlertTriangle size={11} /> Demo intelligence{note ? ` · ${note.slice(0, 40)}` : ""}</Badge>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#4a2622] bg-[rgba(224,112,95,0.06)] px-3 py-2.5 text-[12.5px] text-danger">
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Empty({ title, hint, icon }: { title: string; hint: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 text-faint">{icon}</div>
      <p className="text-[14px] font-medium">{title}</p>
      <p className="text-[12.5px] text-faint mt-1 max-w-sm">{hint}</p>
    </div>
  );
}

export const DemoTag = ({ children = "Illustrative prototype data" }: { children?: ReactNode }) => (
  <span className="text-[10.5px] text-faint tracking-wide">{children}</span>
);

export function KeyValue({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-line-soft last:border-0">
      <span className="text-[12px] text-faint">{k}</span>
      <span className="text-[12.5px] text-fg text-right">{v}</span>
    </div>
  );
}

export function List({ items, tone = "muted" }: { items: string[]; tone?: "muted" | "fg" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((s, i) => (
        <li key={i} className={`flex gap-2 text-[12.5px] leading-relaxed ${tone === "muted" ? "text-muted" : "text-fg"}`}>
          <span className="text-faint mt-[3px] text-[9px]">◆</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}
