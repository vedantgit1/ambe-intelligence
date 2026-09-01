/**
 * Internal knowledge base for the RAG layer.
 * Fictional but operationally realistic documents written for this prototype.
 */

export interface KnowledgeDoc {
  id: string;
  title: string;
  sections: { heading: string; body: string }[];
}

export const KNOWLEDGE: KnowledgeDoc[] = [
  {
    id: "DOC-SOP",
    title: "Recruitment Standard Operating Procedure",
    sections: [
      { heading: "Requirement intake", body: "Every client requirement is logged with headcount, trade, minimum experience, mandatory certifications, destination market and committed start window. A requirement is not released to sourcing until the start window and certification list are confirmed in writing by the client. Requirements without a confirmed start window are held in 'open' status and excluded from sourcing capacity planning." },
      { heading: "Sourcing and screening", body: "Sourcing draws from the internal talent pool first, then partner networks, then open campaigns. Screening is a two-pass process: an eligibility pass against hard gates (experience floor, certification, passport validity, medical clearance, availability) and an evidence pass where the recruiter reviews demonstrated work history. Only candidates clearing both passes enter the shortlist." },
      { heading: "Shortlist and client interview", body: "A shortlist targets three qualified candidates per position for skilled trades and five per position for supervisory roles. Shortlists are accompanied by an evidence summary per candidate. Client interviews are scheduled within five working days of shortlist release; slippage beyond ten days requires a re-confirmation of candidate availability." },
      { heading: "Escalation", body: "Any requirement where a stage dwell time exceeds 1.5x its historical average is escalated to the market lead. Documentation dwell above 12 days is escalated to Operations the same day, because visa slot allocation downstream is calendar-bound and cannot absorb the delay." },
    ],
  },
  {
    id: "DOC-SCREEN",
    title: "Candidate Screening Policy",
    sections: [
      { heading: "Job-relevant criteria only", body: "Screening and scoring may consider only job-relevant evidence: skills, years of relevant experience, certifications and licences, demonstrated outcomes, language ability where the role requires it, lawful work eligibility and availability. Protected characteristics — including religion, caste, race, ethnicity, gender, age, disability and marital status — must never be used, inferred, or recorded as part of a matching decision." },
      { heading: "Evidence standard", body: "A skill is treated as evidenced when it appears alongside a role, employer and duration, or is supported by a certification. Self-declared skills without context are recorded at lower confidence and must be verified at interview. Scores presented to recruiters must always be accompanied by the evidence that produced them." },
      { heading: "Human-in-the-loop", body: "AI-generated shortlists, scores and recommendations are decision support. A named recruiter approves every shortlist, and a named hiring manager makes every selection decision. The platform records who approved what and when, so any decision can be reconstructed later." },
      { heading: "Data minimisation", body: "Only the fields required for matching are sent to the model: role, skills, experience, certifications, languages, availability and market eligibility. Contact details, identity document numbers and any sensitive personal data are excluded from model context." },
    ],
  },
  {
    id: "DOC-DEPLOY",
    title: "Deployment and Mobilisation Workflow",
    sections: [
      { heading: "Stage sequence", body: "Selected candidates progress through offer acceptance, document verification, medical examination, visa processing, ticketing and mobilisation. Document verification and visa processing are the two calendar-bound stages and together account for the majority of end-to-end lead time." },
      { heading: "Documentation bottleneck", body: "Document verification averages 14 days against a 9-day target. The dominant causes historically are: attestation queues at source, incomplete certificate sets submitted at offer stage, and batching candidates for verification instead of processing them on arrival into the stage. Pre-staging attestation at the shortlist stage has previously reduced dwell time by roughly a third." },
      { heading: "Batch re-sequencing", body: "When a batch is at risk of missing a committed start window, the standard intervention is to split it: mobilise medically cleared and document-complete candidates on the original date, and move the remainder to the next window. This preserves the client relationship even when full headcount slips." },
      { heading: "Deployment readiness", body: "A candidate is deployment-ready only when passport validity exceeds six months, medical clearance is current, the certification set matches the client requirement, and the visa is issued. Readiness is re-checked 72 hours before travel." },
    ],
  },
  {
    id: "DOC-TRAINING",
    title: "Training and Certification Framework",
    sections: [
      { heading: "Demand-led training", body: "Training cohorts are planned from forecast demand, not from training-partner availability. A cohort is approved only when forecast demand for the trade exceeds the qualified pool by a margin greater than expected attrition over the training period." },
      { heading: "Assessment and certification", body: "Trainees are assessed against the relevant national qualification level for the trade. Historical rates used for planning are approximately a 90 percent assessment attempt rate and an 87 percent pass rate; cohort sizing should build in that shrinkage. Certification is recorded against the candidate profile and becomes a hard gate in matching." },
      { heading: "Partner selection", body: "Training partners are evaluated on assessment capacity, pass rate, geographic proximity to the candidate supply base, and ability to deliver destination-market safety modules. Single-partner dependency for any high-volume trade is treated as a strategic risk." },
      { heading: "Certification constraints", body: "Where certification slots constrain deployment, the options are: book assessment capacity ahead of cohort completion, add a second partner, or re-sequence deployment towards trades with available certification. The first option is cheapest, the second is the durable fix." },
    ],
  },
  {
    id: "DOC-CLIENT",
    title: "Example Client Requirements Pack",
    sections: [
      { heading: "Gulf Industrial Group — industrial maintenance", body: "Recurring demand for mechanical and instrumentation technicians across cement and petrochemical sites in Saudi Arabia and Bahrain. Minimum five years relevant maintenance experience, national qualification level 5 or equivalent, preference for prior GCC site exposure and basic safety certification. Typical batch size 20 to 30, start window 45 days." },
      { heading: "Desert Engineering Co. — welding", body: "High-volume 6G pipe welding for pipeline and pressure-vessel scopes. ASME IX 6G qualification is a hard gate; structural-only welders are not substitutable. Client conducts its own weld test on arrival, so shortlist precision matters more than volume." },
      { heading: "MENA Healthcare Services — clinical", body: "Licensed nursing and diagnostic imaging roles. Licensing examination and credential verification are hard gates and are the long pole in lead time, typically 60 to 75 days. Demand has been expanding faster than the qualified licensed pool." },
      { heading: "Al Noor Projects — construction", body: "Scaffolding, heavy equipment operation and general construction trades across Kuwait, Qatar and Oman. Demand is shutdown-driven and seasonal, with short start windows; readiness of the standing pool matters more than sourcing speed." },
    ],
  },
  {
    id: "DOC-SKILL",
    title: "Skill-to-Employment Framework",
    sections: [
      { heading: "The chain", body: "The framework runs market demand, skill gap, training, assessment, certification, match, employment. Each link has a measurable conversion rate, and the weakest link caps the whole chain. Treating any single link in isolation — training capacity alone, or sourcing alone — produces effort without placements." },
      { heading: "Gap calculation", body: "Skill gap equals forecast demand minus the qualified and available pool. Qualified means certification and experience gates are met; available means the candidate is not already engaged and is deployment-ready within the start window. Counting the unqualified pool as supply is the most common planning error." },
      { heading: "Alignment with the national skilling ecosystem", body: "Training is mapped to national qualification levels so that certification is portable and recognised, and so that candidates trained for one corridor remain employable if demand shifts. This framework is an operator's implementation aligned with the direction of national skilling policy; it is not a government programme and makes no claim to official status." },
      { heading: "Measuring employability", body: "The outcome metric is certified-to-placed conversion within 90 days of certification, not the number of people trained. Cost per certified placement, cohort completion rate and 6-month retention in role complete the measurement set." },
    ],
  },
];
