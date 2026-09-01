import type {
  ActionItem, AttentionItem, Decision, FunnelStage,
  JobRequirement, MarketRow, Priority,
} from "@/types";
import { CANDIDATES } from "@/lib/data/candidates";
import { KNOWLEDGE } from "@/lib/rag/knowledge";

/**
 * ILLUSTRATIVE PROTOTYPE DATA.
 * Fictional clients and metrics used to demonstrate the product model.
 * Nothing here represents real Ambe International operating data.
 */

export const DATA_LABEL = "Illustrative prototype data";

export const REQUIREMENTS: JobRequirement[] = [
  { id:"REQ-2041", title:"Senior Mechanical Technician", client:"Gulf Industrial Group", market:"Saudi Arabia", sector:"Mechanical", minYears:5, requiredSkills:["Mechanical maintenance","Industrial equipment","Preventive maintenance","Troubleshooting"], preferredSkills:["GCC experience","Hydraulics"], certifications:["NSQF Level 5 Mechanical"], languages:["English"], headcount:24, startWindowDays:45, status:"sourcing" },
  { id:"REQ-2042", title:"6G Pipe Welder", client:"Desert Engineering Co.", market:"Saudi Arabia", sector:"Welding", minYears:5, requiredSkills:["6G welding","TIG","SMAW","Blueprint reading"], preferredSkills:["Pressure vessel"], certifications:["ASME IX 6G"], languages:["English"], headcount:40, startWindowDays:30, status:"shortlisting" },
  { id:"REQ-2043", title:"Industrial Electrician", client:"Gulf Industrial Group", market:"UAE", sector:"Electrical", minYears:4, requiredSkills:["Electrical maintenance","Motor control","Troubleshooting"], preferredSkills:["PLC basics"], certifications:["ITI Electrician"], languages:["English"], headcount:18, startWindowDays:60, status:"sourcing" },
  { id:"REQ-2044", title:"Staff Nurse (ICU)", client:"MENA Healthcare Services", market:"Saudi Arabia", sector:"Healthcare", minYears:3, requiredSkills:["Critical care","Patient monitoring","Emergency response"], preferredSkills:["Ventilator management"], certifications:["BSc Nursing","BLS/ACLS"], languages:["English"], headcount:35, startWindowDays:75, status:"documentation" },
  { id:"REQ-2045", title:"Scaffolder", client:"Al Noor Projects", market:"Kuwait", sector:"Construction", minYears:3, requiredSkills:["Scaffolding erection","Working at height","Safety compliance"], preferredSkills:["Shutdown experience"], certifications:["Scaffolding Level 2"], languages:["English"], headcount:60, startWindowDays:40, status:"sourcing" },
  { id:"REQ-2046", title:"HVAC Technician", client:"Al Noor Projects", market:"Qatar", sector:"Mechanical", minYears:4, requiredSkills:["HVAC maintenance","Chiller systems","Preventive maintenance"], preferredSkills:["Facilities management"], certifications:["ITI Refrigeration"], languages:["English"], headcount:16, startWindowDays:50, status:"shortlisting" },
  { id:"REQ-2047", title:"Front Office Supervisor", client:"Marina Hospitality Group", market:"UAE", sector:"Hospitality", minYears:5, requiredSkills:["Guest relations","Team supervision","Property management systems"], preferredSkills:["Arabic"], certifications:["Hotel Management Diploma"], languages:["English"], headcount:8, startWindowDays:35, status:"sourcing" },
  { id:"REQ-2048", title:"Heavy Equipment Operator", client:"Desert Engineering Co.", market:"Oman", sector:"Construction", minYears:4, requiredSkills:["Excavator operation","Safety compliance"], preferredSkills:["Crane operation"], certifications:["Heavy Vehicle Licence"], languages:["English"], headcount:22, startWindowDays:45, status:"sourcing" },
  { id:"REQ-2049", title:"Instrumentation Technician", client:"Gulf Industrial Group", market:"Bahrain", sector:"Electrical", minYears:4, requiredSkills:["Instrumentation","Calibration","Troubleshooting"], preferredSkills:["PLC basics"], certifications:["ITI Instrument Mechanic"], languages:["English"], headcount:12, startWindowDays:55, status:"shortlisting" },
  { id:"REQ-2050", title:"Radiographer", client:"MENA Healthcare Services", market:"UAE", sector:"Healthcare", minYears:4, requiredSkills:["Radiography","CT imaging","Radiation safety"], preferredSkills:["GCC licence"], certifications:["BSc Radiology"], languages:["English"], headcount:6, startWindowDays:70, status:"documentation" },
  { id:"REQ-2051", title:"Structural Welder", client:"Al Noor Projects", market:"Qatar", sector:"Welding", minYears:3, requiredSkills:["Structural welding","SMAW","Blueprint reading"], preferredSkills:["MIG"], certifications:["NSQF Level 4 Welding"], languages:["English"], headcount:45, startWindowDays:40, status:"sourcing" },
  { id:"REQ-2052", title:"Data Engineer (Internal)", client:"Internal — AI Transformation", market:"UAE", sector:"IT", minYears:4, requiredSkills:["Python","SQL","ETL","Data modelling"], preferredSkills:["Airflow","BI"], certifications:[], languages:["English"], headcount:2, startWindowDays:60, status:"open" },
];

export const KPIS = [
  { key:"active_requirements", label:"Active Requirements", value:34, delta:"+6 WoW", tone:"neutral" as const, sub:`${REQUIREMENTS.length} in this demo dataset` },
  { key:"pipeline", label:"Candidates in Pipeline", value:2481, delta:"+184 WoW", tone:"positive" as const, sub:`${CANDIDATES.length} profiles seeded locally` },
  { key:"placements", label:"Placements This Month", value:128, delta:"-9 vs last month", tone:"negative" as const, sub:"Target 145" },
  { key:"at_risk", label:"At-Risk Projects", value:5, delta:"+2 WoW", tone:"negative" as const, sub:"Documentation-driven" },
];

export const THROUGHPUT = [
  { week:"W-7", requirements:22, screened:410, shortlisted:150, deployed:96 },
  { week:"W-6", requirements:25, screened:455, shortlisted:168, deployed:104 },
  { week:"W-5", requirements:26, screened:470, shortlisted:159, deployed:118 },
  { week:"W-4", requirements:29, screened:512, shortlisted:186, deployed:121 },
  { week:"W-3", requirements:30, screened:498, shortlisted:177, deployed:134 },
  { week:"W-2", requirements:32, screened:544, shortlisted:191, deployed:129 },
  { week:"W-1", requirements:34, screened:571, shortlisted:203, deployed:112 },
];

export const CLIENT_DEMAND = [
  { client:"Gulf Industrial Group", open:54, wow:12 },
  { client:"Desert Engineering Co.", open:62, wow:-4 },
  { client:"MENA Healthcare Services", open:41, wow:31 },
  { client:"Al Noor Projects", open:127, wow:8 },
  { client:"Marina Hospitality Group", open:18, wow:3 },
];

export const FUNNEL: FunnelStage[] = [
  { stage:"Requirements", count:34, avgDays:0 },
  { stage:"Candidates", count:2481, avgDays:2 },
  { stage:"Qualified", count:1342, avgDays:3 },
  { stage:"Shortlisted", count:604, avgDays:4 },
  { stage:"Interviewed", count:388, avgDays:6 },
  { stage:"Selected", count:241, avgDays:3 },
  { stage:"Documentation", count:198, avgDays:14 },
  { stage:"Visa", count:151, avgDays:11 },
  { stage:"Deployed", count:128, avgDays:5 },
];

export const RECRUITER_PRODUCTIVITY = [
  { recruiter:"Team A — Industrial", screened:189, shortlisted:71, deployed:44 },
  { recruiter:"Team B — Healthcare", screened:142, shortlisted:58, deployed:26 },
  { recruiter:"Team C — Construction", screened:214, shortlisted:64, deployed:39 },
  { recruiter:"Team D — Hospitality", screened:96, shortlisted:31, deployed:19 },
];

export const ATTENTION: AttentionItem[] = [
  { id:"AT-1", title:"Saudi Industrial Hiring", detail:"18 selected candidates are blocked at document verification; average dwell time in this stage has risen from 9 to 14 days.", severity:"high", owner:"Mobilisation", status:"Blocked", recommendedAction:"Escalate the document verification workflow and pre-stage attestation for the next two batches.", deadline:"in 3 days" },
  { id:"AT-2", title:"Healthcare Demand Spike", detail:"MENA Healthcare Services requirements increased 31% week-over-week, concentrated in ICU and diagnostic roles.", severity:"high", owner:"Business Development", status:"Open", recommendedAction:"Increase sourcing capacity for licensed nursing and imaging profiles; open a second sourcing corridor.", deadline:"in 5 days" },
  { id:"AT-3", title:"Training Bottleneck", detail:"Certification slots for welding and refrigeration trades may constrain next month's deployment plan by an estimated 60-80 placements.", severity:"medium", owner:"Strategic Initiatives", status:"In review", recommendedAction:"Evaluate two alternate training partners and pre-book assessment capacity.", deadline:"in 10 days" },
  { id:"AT-4", title:"Deployment Slippage — Kuwait", detail:"Scaffolding mobilisation for Al Noor Projects is tracking 11 days behind the committed start window.", severity:"medium", owner:"Operations", status:"At risk", recommendedAction:"Re-sequence the batch: deploy medically-cleared candidates first, hold the remainder.", deadline:"in 7 days" },
  { id:"AT-5", title:"Recruiter Load Imbalance", detail:"Team B is carrying 38% more open roles per recruiter than the average while conversion is 6 points lower.", severity:"low", owner:"AI Transformation", status:"Open", recommendedAction:"Route healthcare screening through AI shortlisting to recover recruiter hours.", deadline:"in 14 days" },
];

export const PRIORITIES: Priority[] = [
  {
    id:"P1", index:"01", title:"Expand high-demand international talent corridors",
    owner:"Business Development", status:"On track", progress:72,
    objective:"Open and qualify two additional supply corridors for industrial and healthcare trades to reduce single-corridor dependency and shorten time-to-fill.",
    milestones:[{label:"Corridor demand study",done:true},{label:"Partner shortlist signed",done:true},{label:"Pilot batch of 40 deployed",done:false},{label:"Corridor SLA agreed",done:false}],
    dependencies:["Client demand forecast","Document verification capacity","Training partner availability"],
    kpis:["Time-to-fill (days)","Corridor concentration %","Offer-to-deployment conversion"],
    risks:["Regulatory change in destination market","Partner quality variance at scale"],
    nextDecision:"Approve the pilot batch size for the second corridor.",
  },
  {
    id:"P2", index:"02", title:"AI-enable recruiter workflows",
    owner:"AI Transformation", status:"In progress", progress:48,
    objective:"Cut manual screening effort per requirement by half using retrieval-backed shortlisting, while keeping every hiring decision human-led and auditable.",
    milestones:[{label:"Matching prototype",done:true},{label:"Recruiter pilot (2 teams)",done:true},{label:"Evidence + audit trail",done:false},{label:"ATS write-back",done:false}],
    dependencies:["Clean candidate data","Recruiter change management","Responsible-AI review"],
    kpis:["Screening hours per requirement","Shortlist precision @10","Recruiter adoption %"],
    risks:["Data quality gaps degrade retrieval","Adoption resistance without training"],
    nextDecision:"Choose between extending the pilot or committing to ATS integration this quarter.",
  },
  {
    id:"P3", index:"03", title:"Build skill-to-employment partnerships",
    owner:"Strategic Initiatives", status:"At risk", progress:34,
    objective:"Convert forecast demand into trained, assessed and certified supply through training partners, aligned with the national skilling ecosystem.",
    milestones:[{label:"Demand-to-skill map",done:true},{label:"Partner MoUs (3)",done:false},{label:"Assessment framework",done:false},{label:"First certified cohort",done:false}],
    dependencies:["Certification body throughput","Demand forecast accuracy","Funding model"],
    kpis:["Certified-to-placed conversion","Cost per certified placement","Cohort completion rate"],
    risks:["Assessment capacity shortfall","Demand shifts before cohorts complete"],
    nextDecision:"Commit to a training partner or defer the cohort by one month.",
  },
];

export const DECISIONS: Decision[] = [
  { id:"D-01", decision:"Expand healthcare sourcing network", context:"Healthcare requirements up 31% WoW; current corridor cannot absorb licensed nursing volume.", owner:"Business Development", date:"2026-08-28", status:"Under review", impact:"High" },
  { id:"D-02", decision:"Escalate document verification to a dedicated cell", context:"Documentation is the largest conversion loss in the funnel at 14 days average dwell.", owner:"Operations", date:"2026-08-26", status:"Approved", impact:"High" },
  { id:"D-03", decision:"Extend AI shortlisting pilot to two more recruiter teams", context:"Pilot teams show reduced screening hours; broader evidence needed before ATS integration.", owner:"AI Transformation", date:"2026-08-25", status:"Under review", impact:"Medium" },
  { id:"D-04", decision:"Add a second welding training partner", context:"Certification slots constrain the next deployment cycle by an estimated 60-80 placements.", owner:"Strategic Initiatives", date:"2026-08-22", status:"Deferred", impact:"High" },
  { id:"D-05", decision:"Standardise candidate data schema across markets", context:"Retrieval quality is limited by inconsistent skill taxonomy between market teams.", owner:"AI Transformation", date:"2026-08-19", status:"Approved", impact:"Medium" },
  { id:"D-06", decision:"Pause Bahrain instrumentation sourcing", context:"Client confirmation delayed; sourcing spend at risk without a signed requirement.", owner:"Business Development", date:"2026-08-15", status:"Rejected", impact:"Low" },
];

export const ACTIONS: ActionItem[] = [
  { id:"A-1", title:"Audit Saudi documentation delays", owner:"Operations", deadline:"2026-09-04", priority:"P0", status:"in_progress" },
  { id:"A-2", title:"Validate healthcare talent supply", owner:"Business Development", deadline:"2026-09-06", priority:"P0", status:"in_progress" },
  { id:"A-3", title:"Review AI CV matching MVP", owner:"AI Transformation", deadline:"2026-09-08", priority:"P1", status:"backlog" },
  { id:"A-4", title:"Assess training partner pipeline", owner:"Strategic Initiatives", deadline:"2026-09-11", priority:"P1", status:"blocked" },
  { id:"A-5", title:"Prepare monthly executive review", owner:"Chief of Staff", deadline:"2026-09-15", priority:"P1", status:"backlog" },
  { id:"A-6", title:"Re-sequence Kuwait scaffolding batch", owner:"Mobilisation", deadline:"2026-09-05", priority:"P0", status:"blocked" },
  { id:"A-7", title:"Publish skill taxonomy v2", owner:"AI Transformation", deadline:"2026-08-29", priority:"P2", status:"done" },
  { id:"A-8", title:"Close Q3 client demand forecast", owner:"Business Development", deadline:"2026-08-27", priority:"P1", status:"done" },
];

export const MARKETS: MarketRow[] = [
  { market:"Saudi Arabia", demandIndex:94, candidateSupply:71, skillGap:29, pipeline:812, opportunityScore:91, note:"Industrial and healthcare demand both expanding; documentation throughput is the binding constraint." },
  { market:"UAE", demandIndex:88, candidateSupply:79, skillGap:21, pipeline:634, opportunityScore:84, note:"Balanced market; hospitality and diagnostics carry the strongest near-term pull." },
  { market:"Oman", demandIndex:76, candidateSupply:68, skillGap:32, pipeline:341, opportunityScore:78, note:"Construction-led demand; operator certifications limit conversion." },
  { market:"Kuwait", demandIndex:72, candidateSupply:64, skillGap:36, pipeline:288, opportunityScore:74, note:"Shutdown-driven seasonality; scaffolding and welding dominate volume." },
  { market:"Qatar", demandIndex:69, candidateSupply:74, skillGap:26, pipeline:246, opportunityScore:71, note:"Steady facilities-management demand; supply is comparatively healthy." },
  { market:"Bahrain", demandIndex:58, candidateSupply:70, skillGap:24, pipeline:160, opportunityScore:63, note:"Smallest volume; useful as an overflow corridor for instrumentation trades." },
];

export const SKILL_PIPELINE = {
  trade: "Welding (6G / Structural)",
  marketDemand: 500,
  qualifiedPool: 318,
  gap: 182,
  recommendedTrainingCapacity: "150–200",
  projectedDeployment: "85–90%",
  stages: [
    { stage:"Market demand", value:500, note:"Aggregated open positions across GCC clients" },
    { stage:"Skill gap", value:182, note:"Demand not coverable by the qualified pool" },
    { stage:"Training", value:190, note:"Recommended intake to absorb attrition" },
    { stage:"Assessment", value:171, note:"~90% assessment attempt rate" },
    { stage:"Certification", value:148, note:"~87% certification pass rate" },
    { stage:"Match", value:139, note:"Retrieval + deterministic eligibility" },
    { stage:"Employment", value:126, note:"Deployed after documentation and visa" },
  ],
  trades: [
    { trade:"Welding", demand:500, qualified:318, gap:182 },
    { trade:"Mechanical", demand:340, qualified:262, gap:78 },
    { trade:"Electrical", demand:295, qualified:214, gap:81 },
    { trade:"Healthcare", demand:410, qualified:238, gap:172 },
    { trade:"Construction", demand:620, qualified:503, gap:117 },
    { trade:"Hospitality", demand:180, qualified:161, gap:19 },
  ],
};

export const SYSTEM_COUNTS = {
  candidates: CANDIDATES.length,
  requirements: REQUIREMENTS.length,
  knowledgeDocs: KNOWLEDGE.length,
};
