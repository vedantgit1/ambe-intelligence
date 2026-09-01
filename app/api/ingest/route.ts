import { NextResponse } from "next/server";
import { badRequest, rateLimit, sanitizeText, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { cvExtractionPrompt, SYSTEM_RECRUITMENT } from "@/lib/ai/prompts";
import { CvProfileSchema, validator } from "@/lib/ai/schema";
import { candidateDocument, ensureIndex } from "@/lib/rag";
import { embedOne } from "@/lib/rag/embeddings";
import type { Candidate } from "@/types";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

/**
 * CV ingestion — MVP scope, stated plainly:
 * .txt is extracted reliably; .pdf uses a best-effort text scrape that works on
 * text-based PDFs only; .docx is not parsed in-process. Anything that fails
 * extraction asks the recruiter to paste the text instead of guessing.
 */
export async function POST(req: Request) {
  if (!rateLimit(req, 10)) return tooMany();
  try {
    const form = await req.formData();
    const file = form.get("file");
    const pasted = sanitizeText(form.get("text"), 20000);

    let text = pasted;
    let sourceName = "pasted text";

    if (!text && file instanceof File) {
      if (file.size > MAX_BYTES) return badRequest("File exceeds the 4 MB limit.");
      const type = file.type || "";
      const name = file.name.toLowerCase();
      const okExt = name.endsWith(".txt") || name.endsWith(".pdf") || name.endsWith(".docx");
      if (!okExt && !ALLOWED.includes(type)) return badRequest("Only .txt, .pdf and .docx files are accepted.");
      sourceName = file.name;
      const buf = Buffer.from(await file.arrayBuffer());
      text = name.endsWith(".pdf") || type === "application/pdf" ? extractPdfText(buf) : buf.toString("utf8");
      text = sanitizeText(text, 20000);
    }

    if (text.replace(/[^a-zA-Z]/g, "").length < 80) {
      return badRequest("Could not extract enough text. This prototype parses .txt reliably and text-based .pdf on a best-effort basis — paste the CV text instead.");
    }

    const result = await withFallback(
      () => generateJson(cvExtractionPrompt(text), validator(CvProfileSchema), { tier: "fast", system: SYSTEM_RECRUITMENT, maxOutputTokens: 2048 }),
      () => validator(CvProfileSchema)(heuristicProfile(text, sourceName)),
      geminiConfigured(),
    );

    // Embed the new profile and add it to the live retrieval index.
    const candidate: Candidate = {
      id: `C-UP-${Date.now().toString().slice(-6)}`,
      name: result.data.name, role: result.data.role || "Candidate",
      sector: result.data.sector, years: result.data.years,
      location: result.data.location || "Not stated", nationality: "Not recorded",
      skills: result.data.skills, certifications: result.data.certifications,
      languages: result.data.languages.length ? result.data.languages : ["English"],
      availability: result.data.availability, gccExperience: /gcc|saudi|uae|dubai|qatar|oman|kuwait|bahrain/i.test(text),
      passportValid: true, medicalCleared: false,
      summary: result.data.summary, expectedSalaryUsd: 0,
    };
    await ensureIndex();
    const { mode } = await embedOne(candidateDocument(candidate));

    return NextResponse.json({
      ...result,
      candidate,
      indexed: { embeddingMode: mode, note: "Profile embedded into the retrieval layer for this session (in-memory store)." },
      parsing: { source: sourceName, note: "MVP extraction — not production-grade document parsing." },
    });
  } catch (e) {
    return serverError(e);
  }
}

/** Best-effort text extraction for uncompressed text-based PDFs. */
function extractPdfText(buf: Buffer): string {
  const raw = buf.toString("latin1");
  const out: string[] = [];
  const re = /\((?:\\.|[^\\()])*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const s = m[0].slice(1, -1).replace(/\\([()\\])/g, "$1");
    if (s.trim().length > 1) out.push(s);
  }
  return out.join(" ").replace(/\s+/g, " ");
}

/** Deterministic extraction used when the model is unavailable. */
function heuristicProfile(text: string, source: string) {
  const lower = text.toLowerCase();
  const skillBank = ["mechanical maintenance","preventive maintenance","troubleshooting","industrial equipment","electrical maintenance","welding","tig","mig","scaffolding","hvac","instrumentation","patient care","critical care","python","sql","react","typescript","guest relations","crane operation"];
  const years = Number(lower.match(/(\d{1,2})\s*\+?\s*(?:years|yrs)/)?.[1] ?? 0);
  const firstLine = text.split(/\n|\.\s/)[0]?.trim().slice(0, 60) || "Unnamed candidate";
  return {
    name: firstLine,
    role: "Extracted profile",
    sector: /weld/.test(lower) ? "Welding" : /nurse|patient/.test(lower) ? "Healthcare" : /electric/.test(lower) ? "Electrical" : "Mechanical",
    years,
    location: "Not stated",
    skills: skillBank.filter((s) => lower.includes(s)),
    certifications: (text.match(/\b(NSQF[^,\n]{0,20}|ITI [A-Za-z]+|ASME IX[^,\n]{0,8}|NEBOSH [A-Z]+|CSWIP [\d.]+|BSc [A-Za-z]+)\b/g) ?? []).slice(0, 6),
    languages: ["English"],
    education: [],
    availability: "immediate",
    summary: `Demo intelligence: deterministic extraction from ${source}. Gemini is not configured, so field coverage is limited.`,
    extractionNotes: ["Rule-based extraction — verify every field before use."],
  };
}
