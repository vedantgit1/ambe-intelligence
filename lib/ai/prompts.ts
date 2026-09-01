/**
 * All prompts live here, versioned as data — never inline in UI components.
 * Every prompt states the output contract explicitly; every response is
 * validated by lib/ai/schema.ts before it reaches the UI.
 */

export const FAIRNESS_RULE = `FAIRNESS (non-negotiable): never infer, mention, or score any protected
characteristic — religion, caste, race, ethnicity, gender, age, disability,
marital status, pregnancy, or national origin used as a proxy for these.
Assess only job-relevant evidence: skills, experience, certifications,
demonstrated outcomes, availability and lawful work eligibility. You assist a
human recruiter; you do not make the hiring decision.`;

export const SYSTEM_RECRUITMENT = `You are the reasoning layer of Ambe Intelligence, an internal AI platform for
an international recruitment and workforce mobility company (GCC markets:
Saudi Arabia, UAE, Oman, Kuwait, Qatar, Bahrain). You are precise, evidence-led
and commercially literate. You never invent facts that are not present in the
supplied context; when evidence is thin you say so and lower your confidence.
${FAIRNESS_RULE}`;

export const SYSTEM_EXECUTIVE = `You are the Chief of Staff intelligence layer of Ambe Intelligence. You write
for a CEO and leadership team. You are concise, specific and decision-oriented.
Every observation must lead to a consequence, an owner, and a timeframe. You
never pad, never hedge without reason, and never present a number you were not
given. All data you receive is clearly-labelled illustrative prototype data;
treat it as the operating picture but never claim it is externally verified.`;

/* ── 1. Job requirement extraction ─────────────────────────────────────── */
export const jobAnalysisPrompt = (raw: string) => `Extract a structured hiring requirement from the recruiter's free-text brief.

BRIEF:
"""
${raw}
"""

Return JSON exactly of this shape:
{
  "role": string,
  "seniority": string,
  "sector": one of ["Mechanical","Electrical","Welding","Construction","Healthcare","Hospitality","IT"],
  "market": string,
  "minYears": number,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "certifications": string[],
  "languages": string[],
  "constraints": string[],
  "niceToHave": string[],
  "searchQuery": string,
  "notes": string
}

Rules:
- "searchQuery" is a dense natural-language description of the ideal candidate,
  used for semantic retrieval. Include the trade, core skills and context. No fluff.
- "constraints" are hard, checkable gates (minimum years, certification, market
  eligibility, availability). Never include a protected characteristic.
- Do not invent certifications the brief does not imply.`;

/* ── 2/3/4/5. Candidate evaluation, ranking, gaps, interview questions ──── */
export const candidateMatchPrompt = (job: string, candidate: string, deterministic: string) => `Evaluate one candidate against one requirement.

REQUIREMENT:
${job}

CANDIDATE (retrieved from the talent pool):
${candidate}

DETERMINISTIC SCORING ALREADY COMPUTED BY THE PLATFORM (authoritative — do not contradict):
${deterministic}

Your job is the reasoning the rules cannot do: read the evidence, judge fit
quality, name real gaps, and give the recruiter something to act on.

Return JSON exactly of this shape:
{
  "overallScore": number 0-100,
  "confidence": number 0-100,
  "strengths": string[3-5],
  "gaps": string[1-4],
  "risks": string[1-3],
  "recommendation": string (one or two sentences, decision-oriented),
  "evidence": string[2-4] (each quotes or cites a concrete fact from the profile),
  "trainingRecommendations": string[1-3],
  "interviewQuestions": string[3-5] (technical and probing, specific to this gap set)
}

Rules:
- "overallScore" must stay within 8 points of the deterministic score unless you
  state the reason in "risks". The deterministic score is the auditable one.
- "confidence" reflects evidence quality, not enthusiasm.
- Never reference or infer a protected characteristic.`;

/* ── 6. Skill-gap / Skill-to-employment ────────────────────────────────── */
export const skillGapPrompt = (context: string) => `Analyse the workforce skill gap below from a skill-to-employment perspective:
demand becomes training becomes assessment becomes certification becomes
placement. Think like a workforce-development strategist working alongside the
national skilling ecosystem — this is an operator's plan, not a government scheme.

DATA (illustrative prototype data):
${context}

Return JSON exactly of this shape:
{
  "headline": string,
  "highestDemandSkills": [{"skill": string, "why": string}],
  "shortages": [{"trade": string, "gap": number, "implication": string}],
  "recommendedTraining": [{"program": string, "cohortSize": string, "durationWeeks": number, "rationale": string}],
  "expectedImpact": {"placements": string, "timeToDeployWeeks": string, "conversionUplift": string},
  "risks": string[2-4],
  "next7Days": string[3-5]
}`;

/* ── 7. Executive brief / daily brief ──────────────────────────────────── */
export const executiveBriefPrompt = (context: string) => `Produce today's executive brief for the leadership team.

OPERATING DATA (illustrative prototype data):
${context}

Return JSON exactly of this shape:
{
  "asOf": string,
  "businessPulse": string,
  "recruitmentPulse": string,
  "clientPulse": string,
  "whatChanged": string[2-4],
  "whyItMatters": string,
  "bottlenecks": [{"area": string, "detail": string, "impact": string}],
  "risks": [{"risk": string, "severity": "high"|"medium"|"low", "mitigation": string}],
  "opportunities": [{"opportunity": string, "value": string}],
  "decisionsRequired": [{"decision": string, "owner": string, "by": string}],
  "topThreeActions": [{"action": string, "owner": string, "by": string, "why": string}]
}

Rules:
- Cite the actual numbers you were given. Never invent a metric.
- "topThreeActions" is exactly three, ordered by leverage.
- Every action has a named owner and a date or day-count.`;

/* ── 8. Strategy / action plan ─────────────────────────────────────────── */
export const strategyPrompt = (priority: string, context: string) => `Turn this strategic priority into an executable plan a Chief of Staff can run.

PRIORITY:
${priority}

BUSINESS CONTEXT (illustrative prototype data):
${context}

Return JSON exactly of this shape:
{
  "objective": string,
  "initiatives": [{"name": string, "outcome": string}],
  "sequencing": [{"phase": string, "weeks": string, "focus": string}],
  "ownerRecommendations": [{"workstream": string, "owner": string, "why": string}],
  "dependencies": string[2-5],
  "kpis": [{"kpi": string, "target": string, "cadence": string}],
  "risks": [{"risk": string, "mitigation": string}],
  "next7Days": [{"action": string, "owner": string, "by": string}]
}`;

/* ── 9. Decision support ───────────────────────────────────────────────── */
export const decisionPrompt = (decision: string, context: string) => `Prepare decision support for a leadership decision.

DECISION UNDER CONSIDERATION:
${decision}

BUSINESS CONTEXT (illustrative prototype data):
${context}

Return JSON exactly of this shape:
{
  "context": string,
  "options": [{"option": string, "pros": string[2-3], "cons": string[2-3]}],
  "risks": string[2-4],
  "recommendation": string,
  "confidence": number 0-100,
  "reversibility": "one-way"|"two-way",
  "whatWouldChangeMyMind": string[1-3]
}`;

/* ── 10. Risk analysis ─────────────────────────────────────────────────── */
export const riskAnalysisPrompt = (context: string) => `Diagnose the operational funnel below. Identify the true bottleneck, the most
likely causes, and the interventions that would move it.

FUNNEL AND OPERATING DATA (illustrative prototype data):
${context}

Return JSON exactly of this shape:
{
  "bottleneck": string,
  "evidence": string[2-4],
  "likelyCauses": [{"cause": string, "confidence": "high"|"medium"|"low"}],
  "interventions": [{"intervention": string, "effort": "low"|"medium"|"high", "expectedImpact": string, "owner": string}],
  "leadingIndicators": string[2-4],
  "ifIgnored": string
}`;

/* ── 11. Copilot (grounded, RAG-backed) ────────────────────────────────── */
export const copilotPrompt = (question: string, business: string, retrieved: string) => `Answer the leadership question below as the Chief of Staff copilot.

QUESTION:
${question}

OPERATING DATA (illustrative prototype data):
${business}

RETRIEVED INTERNAL KNOWLEDGE (the only internal documents you may rely on):
${retrieved || "(no relevant internal document passages retrieved)"}

Return JSON exactly of this shape:
{
  "answer": string (2-5 short paragraphs or tight bullets, in markdown),
  "keyPoints": string[2-4],
  "recommendedActions": [{"action": string, "owner": string, "by": string}],
  "confidence": number 0-100,
  "usedRetrieval": boolean
}

Rules:
- If the retrieved passages do not cover the question, say so plainly instead of
  inventing internal policy. Answer from the operating data and label it as such.
- Be specific with numbers from the operating data. No generic management advice.`;

/* ── 12. CV / document ingestion ───────────────────────────────────────── */
export const cvExtractionPrompt = (text: string) => `Extract a structured candidate profile from this CV text. It may be noisy —
extract only what is actually present.

CV TEXT:
"""
${text.slice(0, 12000)}
"""

Return JSON exactly of this shape:
{
  "name": string,
  "role": string,
  "sector": one of ["Mechanical","Electrical","Welding","Construction","Healthcare","Hospitality","IT"],
  "years": number,
  "location": string,
  "skills": string[],
  "certifications": string[],
  "languages": string[],
  "education": string[],
  "availability": "immediate"|"30_days"|"60_days"|"engaged",
  "summary": string,
  "extractionNotes": string[]
}

Rules:
- ${FAIRNESS_RULE.replace(/\n/g, " ")}
- Do NOT extract date of birth, gender, marital status, religion, or photographs.
- If a field is absent, use an empty string / empty array — never guess.
- Put anything ambiguous into "extractionNotes".`;
