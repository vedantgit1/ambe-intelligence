"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge, Card, PageHead } from "@/components/ui/primitives";
import { ACTIONS } from "@/lib/data/business";
import type { ActionItem } from "@/types";

const COLUMNS: { key: ActionItem["status"]; label: string; tone: string }[] = [
  { key: "backlog", label: "Backlog", tone: "neutral" },
  { key: "in_progress", label: "In progress", tone: "accent" },
  { key: "blocked", label: "Blocked", tone: "danger" },
  { key: "done", label: "Done", tone: "ok" },
];

export default function ActionsPage() {
  const [items, setItems] = useState<ActionItem[]>(ACTIONS);
  const [dragId, setDragId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", owner: "Chief of Staff", deadline: "", priority: "P1" as ActionItem["priority"] });

  function move(id: string, status: ActionItem["status"]) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  function add() {
    if (!draft.title.trim()) return;
    setItems((prev) => [
      { id: `A-${Date.now().toString().slice(-5)}`, title: draft.title.trim(), owner: draft.owner, deadline: draft.deadline || "unscheduled", priority: draft.priority, status: "backlog" },
      ...prev,
    ]);
    setDraft({ title: "", owner: "Chief of Staff", deadline: "", priority: "P1" });
    setAdding(false);
  }

  return (
    <div>
      <PageHead
        title="Action Tracker"
        sub="Decisions become owned, dated work — or they did not happen."
        right={<button onClick={() => setAdding((v) => !v)} className="btn btn-primary"><Plus size={14} /> Add Action</button>}
      />

      {adding && (
        <Card className="p-4 mb-3.5">
          <div className="grid md:grid-cols-5 gap-2">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="What needs to happen?"
              className="md:col-span-2 rounded-[10px] border border-line-soft bg-surface px-3 py-2 text-[12.5px] outline-none focus:border-line" />
            <input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="Owner"
              className="rounded-[10px] border border-line-soft bg-surface px-3 py-2 text-[12.5px] outline-none focus:border-line" />
            <input value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} placeholder="Deadline (YYYY-MM-DD)"
              className="rounded-[10px] border border-line-soft bg-surface px-3 py-2 text-[12.5px] outline-none focus:border-line" />
            <div className="flex gap-2">
              <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as ActionItem["priority"] })}
                className="rounded-[10px] border border-line-soft bg-surface px-2 py-2 text-[12.5px] outline-none">
                <option>P0</option><option>P1</option><option>P2</option>
              </select>
              <button onClick={add} className="btn btn-primary flex-1 justify-center">Add</button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {COLUMNS.map((col) => {
          const list = items.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) move(dragId, col.key); setDragId(null); }}
              className="rounded-[16px] border border-line-soft bg-[rgba(17,20,23,0.5)] p-3 min-h-[320px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="label">{col.label}</span>
                <Badge tone={col.tone}>{list.length}</Badge>
              </div>
              <div className="space-y-2">
                {list.map((i) => (
                  <motion.div
                    key={i.id} layout draggable
                    onDragStart={() => setDragId(i.id)} onDragEnd={() => setDragId(null)}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="card card-hover p-3 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12.5px] leading-snug">{i.title}</p>
                      <Badge tone={i.priority === "P0" ? "danger" : i.priority === "P1" ? "warn" : "neutral"}>{i.priority}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-faint">
                      <span>{i.owner}</span>
                      <span>{i.deadline}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {COLUMNS.filter((c) => c.key !== i.status).map((c) => (
                        <button key={c.key} onClick={() => move(i.id, c.key)}
                          className="text-[10px] text-faint hover:text-accent border border-line-soft hover:border-line rounded px-1.5 py-0.5 transition-colors">
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {list.length === 0 && <p className="text-[11.5px] text-faint px-1 py-6 text-center">Drag an action here</p>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-faint mt-4">
        Drag cards between columns, or use the inline status buttons. State is session-local in this prototype —
        production would persist through the repository layer.
      </p>
    </div>
  );
}
