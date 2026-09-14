/**
 * One-shot extractor: pull live automotive/vehicle data from GoInfo pages
 * into automotive/data.js. Run: node automotive/extract.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function extractBalanced(text, startPat) {
  const m = text.match(startPat);
  if (!m) return null;
  let i = m.index + m[0].length;
  while (i < text.length && " \n\r\t=".includes(text[i])) i += 1;
  while (i < text.length && !"[{".includes(text[i])) i += 1;
  if (i >= text.length) return null;
  const pairs = { "[": "]", "{": "}" };
  const stack = [];
  let inStr = null;
  let esc = false;
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (c === "[" || c === "{") stack.push(pairs[c]);
    else if (c === "]" || c === "}") {
      if (!stack.length || stack[stack.length - 1] !== c) return null;
      stack.pop();
      if (!stack.length) return text.slice(i, j + 1);
    }
  }
  return null;
}

function evalJs(blob) {
  const ctx = { result: undefined };
  vm.createContext(ctx);
  vm.runInContext("result = " + blob, ctx);
  return ctx.result;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function grab(html, name) {
  const blob = extractBalanced(html, new RegExp("(?:const|let|var)\\s+" + name + "\\s*="));
  if (!blob) throw new Error("missing " + name);
  return evalJs(blob);
}

function ieltsNum(s) {
  if (s == null || s === "") return null;
  if (typeof s === "number") return s >= 3 && s <= 9.5 ? s : null;
  const m = String(s).match(/IELTS[^\d]{0,16}(\d(?:\.\d)?)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 3 && n <= 9.5 ? n : null;
}

function levelFrom(p) {
  const blob = `${p.qual || ""} ${p.award || ""} ${p.qualification || ""} ${p.type || ""} ${p.kind || ""} ${p.level || ""}`.toLowerCase();
  if (/twoplus|2\+2|aas \+ b\.s|associate then/.test(blob)) return "2+2 / transfer";
  if (/\baas\b|associate/.test(blob)) return "Associate";
  if (/vocational|vet|certificate|diploma/.test(blob) && !/bachelor|honours|beng|meng|bsc/.test(blob)) {
    if (/certificate|vet|level 3/.test(blob)) return "Certificate / VET";
    return "Diploma";
  }
  if (/foundation/.test(blob)) return "Foundation";
  if (/vocational bachelor|vocbachelor/.test(blob)) return "Vocational bachelor";
  if (/bachelor|beng|meng|honours|nfq|bsc|b\.s|bst/.test(blob)) return "Bachelor";
  return p.type || p.award || "Bachelor";
}

function langTextOf(p) {
  if (p.langText) return p.langText;
  if (p.language && !/^(verified|conditional|yes|no|maybe)$/i.test(p.language)) return p.language;
  if (p.lang && !/^(verified|conditional|yes|no|maybe)$/i.test(String(p.lang))) return p.lang;
  if (p.ielts != null || /english/i.test(String(p.english || ""))) return "English";
  return "";
}

function statusOf(p) {
  const candidates = [p.st, p.tier, p.status];
  for (const c of candidates) {
    if (c && String(c).length <= 22) return String(c);
  }
  return "ranked";
}

function noteOf(p) {
  if (p.status && String(p.status).length > 22) return p.status;
  if (p.caution) return p.caution;
  return "";
}

function regionOfCountry(country) {
  const map = {
    China: "china",
    Malaysia: "malaysia",
    Australia: "anz",
    "New Zealand": "anz",
    Ireland: "ukie",
    "United Kingdom": "ukie",
    UK: "ukie",
    IE: "ukie",
    Germany: "eu",
    Netherlands: "eu",
    Finland: "eu",
    Hungary: "eu",
    Italy: "eu",
    Lithuania: "eu",
    Romania: "eu",
    Singapore: "eastasia",
    Japan: "eastasia",
    "South Korea": "eastasia",
    Taiwan: "eastasia",
    USA: "usa",
    "United States": "usa"
  };
  return map[country] || "other";
}

function countryName(codeOrName) {
  const map = { UK: "United Kingdom", IE: "Ireland", AU: "Australia", NZ: "New Zealand", NL: "Netherlands", FI: "Finland", HU: "Hungary", DE: "Germany", IT: "Italy", LT: "Lithuania", RO: "Romania" };
  return map[codeOrName] || codeOrName;
}

const chinaHtml = read("china-auto-guide/index.html");
const euHtml = read("eu-auto-guide/index.html");
const ukHtml = read("uk-ireland-auto-guide/index.html");
const usaHtml = read("usa-auto-guide/index.html");
const anzHtml = read("australia-nz-auto-guide/index.html");
const autoHtml = read("auto/index.html");
const malJs = read("malaysia-auto-guide/data.js");
const cucasJs = read("china-vehicle-engineering/data.js");

const institutions = grab(autoHtml, "institutions");
const chinaP = grab(chinaHtml, "P");
const chinaPicks = grab(chinaHtml, "PICKS");
const chinaAnswers = grab(chinaHtml, "ANSWERS");
const chinaCities = grab(chinaHtml, "CITIES");
const chinaCountries = grab(chinaHtml, "COUNTRIES");
const chinaSkills = grab(chinaHtml, "SKILLS");
const chinaTodo = grab(chinaHtml, "TODO");
const chinaQuestions = grab(chinaHtml, "QUESTIONS");
const chinaChinaPaths = grab(chinaHtml, "PATHS");
const chinaProfile = grab(chinaHtml, "PROFILE");
const chinaFlags = grab(chinaHtml, "FLAGS");

const euP = grab(euHtml, "P");
const euPicks = grab(euHtml, "PICKS");
const euAnswers = grab(euHtml, "ANSWERS");
const euCities = grab(euHtml, "CITIES");
const euProfile = grab(euHtml, "PROFILE");

const ukP = grab(ukHtml, "P");
const ukPicks = grab(ukHtml, "PICKS");
const ukAnswers = grab(ukHtml, "ANSWERS");
const ukCities = grab(ukHtml, "CITIES");
const ukProfile = grab(ukHtml, "PROFILE");

const usaP = grab(usaHtml, "P");
const usaPicks = grab(usaHtml, "PICKS");
const usaAnswers = grab(usaHtml, "ANSWERS");
const usaCities = grab(usaHtml, "CITIES");
const usaProfile = grab(usaHtml, "PROFILE");

const anzP = grab(anzHtml, "P");
const anzPicks = grab(anzHtml, "PICKS");
const anzAnswers = grab(anzHtml, "ANSWERS");
const anzCities = grab(anzHtml, "CITIES");
const anzProfile = grab(anzHtml, "PROFILE");

const mal = evalJs(malJs.replace(/^window\.REPORT_DATA\s*=\s*/, "").replace(/;\s*$/, ""));
const cucasCtx = {};
vm.createContext(cucasCtx);
vm.runInContext(cucasJs.replace(/^window\./, "var ") + "\nresult = CUCAS_VEHICLE_BACHELOR;", cucasCtx);
const cucas = cucasCtx.result;

function mapCity(c) {
  if (!Array.isArray(c)) {
    return {
      name: c.n || c.city || c.name || c.location || "",
      score: c.score ?? null,
      why: c.why || c.industry || c.evidence || c.environment || ""
    };
  }
  if (typeof c[1] === "string" && typeof c[2] === "number") {
    return { name: c[0], country: c[1], score: c[2], why: c[3] || "", note: c[4] || "" };
  }
  if (typeof c[1] === "number") {
    return { name: c[0], score: c[1], why: c[2] || "", note: c[3] || "" };
  }
  return { name: String(c[0] || ""), score: c[1] ?? null, why: c[2] || "" };
}

function pickName(list, picks) {
  return picks.map((pk) => {
    const row = list.find((p) => p.id === pk.id);
    return {
      role: pk.role,
      institution: row ? row.inst || row.institution : "",
      program: row ? row.prog || row.program : "",
      city: row ? row.city : "",
      country: row ? countryName(row.country || "") : "",
      text: pk.text,
      score: row ? row.score : null
    };
  });
}

function fromGuide(p, region, countryFallback, guide) {
  const country = countryName(p.country || countryFallback);
  const ielts = p.ielts != null ? ieltsNum(p.ielts) : ieltsNum(p.english);
  return {
    id: `${region}-${p.id}`,
    source: "guide",
    region,
    country,
    institution: p.inst,
    program: p.prog,
    city: p.city || "",
    qualification: p.qual || p.award || "",
    level: levelFrom(p),
    years: p.years || null,
    language: langTextOf(p),
    ielts,
    english: p.english || "",
    entry: p.entry || p.grade || "",
    practical: p.practical || "",
    ev: p.ev || "",
    career: p.career || p.fit || "",
    industry: p.industry || "",
    scholarship: p.scholarship || "",
    score: p.score ?? null,
    status: statusOf(p),
    note: noteOf(p),
    tuitionText: p.tuitionText || (p.tuition != null ? String(p.tuition) : ""),
    annual: p.annual ?? null,
    est: !!p.est,
    currency: p.cur || "",
    url: p.url || "",
    guide
  };
}

function fromMal(p) {
  return {
    id: `malaysia-${p.rank}`,
    source: "guide",
    region: "malaysia",
    country: "Malaysia",
    institution: p.institution,
    program: p.program,
    city: p.city,
    qualification: p.qualification,
    level: levelFrom(p),
    years: null,
    language: p.language,
    ielts: ieltsNum(p.englishDetail),
    english: p.englishDetail || p.language,
    entry: p.entry || "",
    practical: p.handsOn || "",
    ev: p.ev || "",
    career: p.career || "",
    industry: "",
    scholarship: "",
    score: p.score,
    status: p.tier,
    tuitionText: p.tuition,
    annual: null,
    est: false,
    currency: "MYR",
    url: "",
    guide: "../malaysia-auto-guide/"
  };
}

function fromAuto(inst) {
  return {
    id: `finder-${inst.id}`,
    source: "finder",
    region: regionOfCountry(inst.country),
    country: inst.country,
    institution: inst.name,
    program: inst.specialties,
    city: inst.location,
    qualification: inst.type,
    level: inst.type,
    years: null,
    language: inst.language,
    ielts: inst.ieltsMin,
    english: inst.requirements,
    entry: inst.requirements,
    practical: inst.dept,
    ev: inst.specialties,
    career: "",
    industry: inst.ownership,
    scholarship: "",
    score: null,
    status: "finder",
    tuitionText: "",
    annual: null,
    est: false,
    currency: "",
    url: inst.url,
    guide: "../auto/",
    intakes: inst.intakes,
    deadlines: inst.deadlines,
    ownership: inst.ownership,
    agentsGCC: inst.agentsGCC,
    agentsPK: inst.agentsPK
  };
}

function fromCucas(p, i) {
  return {
    id: `cucas-${i + 1}`,
    source: "cucas",
    region: "china",
    country: "China",
    institution: p.university,
    program: p.program_name,
    city: p.city_province,
    qualification: p.degree_level,
    level: "Bachelor",
    years: 4,
    language: p.language,
    ielts: ieltsNum(p.special_notes),
    english: p.special_notes,
    entry: p.special_notes,
    practical: "",
    ev: "",
    career: "",
    industry: "",
    scholarship: p.scholarship_notes,
    score: null,
    status: "cucas",
    tuitionText: p.tuition,
    annual: null,
    est: false,
    currency: "CNY",
    url: p.cucas_url,
    guide: "../china-vehicle-engineering/",
    deadline: p.application_deadline,
    start: p.starting_date,
    applicationFee: p.application_fee
  };
}

const programs = [
  ...chinaP.map((p) => fromGuide(p, "china", "China", "../china-auto-guide/")),
  ...mal.programs.map(fromMal),
  ...euP.map((p) => fromGuide(p, "eu", p.country, "../eu-auto-guide/")),
  ...ukP.map((p) => fromGuide(p, "ukie", p.country, "../uk-ireland-auto-guide/")),
  ...usaP.map((p) => fromGuide(p, "usa", "USA", "../usa-auto-guide/")),
  ...anzP.map((p) => fromGuide(p, "anz", p.country, "../australia-nz-auto-guide/")),
  ...institutions.map(fromAuto),
  ...cucas.programs.map(fromCucas)
];

const regions = [
  {
    id: "china",
    name: "China",
    href: "../china-auto-guide/",
    extraHref: "../china-vehicle-engineering/",
    extraLabel: "CUCAS Vehicle Engineering list",
    headline: "An applied bachelor is the best route",
    firstChoice: "Chang’an University, Automobile Service Engineering — English, four years, about KWD 2,069 a year all in.",
    conclusion: "Best value if the exact English program is verified. Strongest current fit is Chang’an in Xi’an (Automobile Service Engineering or Intelligent Vehicle Engineering). Vocational colleges are often missing from the top because English teaching for international students is not proven.",
    picks: pickName(chinaP, chinaPicks),
    answers: chinaAnswers.slice(0, 6),
    cities: chinaCities.slice(0, 6).map(mapCity),
    visa: {
      title: "Student visa, document-driven",
      work: "Post-study work is less attractive than Canada or Australia. Mandarin greatly improves employment.",
      note: "Several universities now require CSCA. Jiangsu requires HSK 4 to graduate even on an English track."
    }
  },
  {
    id: "malaysia",
    name: "Malaysia",
    href: "../malaysia-auto-guide/",
    headline: "English plus practical training, at a moderate cost",
    firstChoice: "UniKL MIAT, Bachelor of Automotive Engineering Technology (Maintenance) — workshop practice, autotronics, RM78,000 tuition total.",
    conclusion: mal.summary.mainConclusion,
    picks: mal.summary.bullets.slice(0, 5).map((b, i) => ({
      role: ["First choice", "Public practical", "EV / diagnostics", "Low-cost public", "Industry campus"][i],
      institution: "",
      program: "",
      city: "",
      country: "Malaysia",
      text: b.replace(/\s*\[[0-9]+\]/g, "").replace(/\s*\[[0-9]+\]/g, ""),
      score: null
    })),
    answers: [],
    cities: mal.locations.slice(0, 6).map(mapCity),
    visa: {
      title: "Generally accessible study environment",
      work: "Possible, but the immigration pathway is less generous than Canada or Australia.",
      note: "Do not treat MIS as an undergraduate scholarship (2026 MIS is postgraduate only). Confirm 2027 English medium in writing."
    }
  },
  {
    id: "eu",
    name: "EU / Schengen",
    href: "../eu-auto-guide/",
    headline: "Europe is not one market",
    firstChoice: "Fontys University of Applied Sciences, Automotive Engineering — four years in Eindhoven, about KWD 9,147 a year all in.",
    conclusion: "If the budget can support Western Europe, apply first to Fontys, HAN and Metropolia. If value matters more, prioritise Széchenyi, John von Neumann and VILNIUS TECH. For autonomous driving and ADAS, TH Ingolstadt belongs in the top three. English teaching must be verified; an English website is not enough.",
    picks: pickName(euP, euPicks),
    answers: euAnswers.slice(0, 6),
    cities: euCities.slice(0, 6).map(mapCity),
    visa: {
      title: "National student permits inside Schengen",
      work: "Work rights and post-study options vary by country. German employment is strong if German language is achieved.",
      note: "Germany has world-class industry but few fully English undergraduate automotive programs. Hungary scholarships (e.g. Stipendium Hungaricum) can change the cost picture."
    }
  },
  {
    id: "ukie",
    name: "UK & Ireland",
    href: "../uk-ireland-auto-guide/",
    headline: "Two very different markets",
    firstChoice: "Oxford Brookes, Automotive Engineering with Electric Vehicles — BEng or MEng, about KWD 14,633 a year all in.",
    conclusion: "Engineering plus EV plus a future master: Oxford Brookes. Dedicated EV engineering at lower cost: ATU Letterkenny. Automotive technology plus business ownership: MTU Cork. Pure workshop and diagnostics: TU Dublin, but only with a written Level 8 progression plan.",
    picks: pickName(ukP, ukPicks),
    answers: ukAnswers.slice(0, 6),
    cities: ukCities.slice(0, 6).map(mapCity),
    visa: {
      title: "UK Student visa vs Ireland Stamp 2",
      work: "UK: typically 20 hours/week in term. Ireland Stamp 2: 20 hours/week in term, 40 in designated vacations. Ireland Level 8 graduates can get 12 months Stamp 1G; Level 7 is not included.",
      note: "UK Graduate visa applications from 1 January 2027 get 18 months (not 2 years). Student visa £558 plus IHS £776/year. Ireland first-year funds benchmark €10,000."
    }
  },
  {
    id: "usa",
    name: "USA",
    href: "../usa-auto-guide/",
    headline: "A practical bachelor beats pure theory",
    firstChoice: "Southern Illinois University Carbondale, B.S. Automotive Technology — four years, about KWD 12,522 a year all in.",
    conclusion: "Choose an applied four-year automotive bachelor or a strong 2+2 automotive technology route. Not a purely theoretical mechanical engineering degree, and not a stand-alone two-year mechanic diploma unless the goal is technician work.",
    picks: pickName(usaP, usaPicks),
    answers: usaAnswers.slice(0, 6),
    cities: usaCities.slice(0, 6).map(mapCity),
    visa: {
      title: "F-1, CPT, OPT and STEM OPT",
      work: "Post-completion OPT is generally up to 12 months. A further 24-month STEM OPT exists only when the CIP code is on the DHS STEM list and job/employer conditions are met.",
      note: "Never choose a US program because someone promises a “3 year work visa.” Ask in writing: CIP code on the I-20, STEM designation, and STEM OPT eligibility for this exact program."
    }
  },
  {
    id: "anz",
    name: "Australia & New Zealand",
    href: "../australia-nz-auto-guide/",
    headline: "Two countries, two different answers",
    firstChoice: "Unitec, Auckland: certificate then Bachelor of Applied Technology — four years total, about KWD 9,994 a year all in.",
    conclusion: "If practical EV diagnostics is the goal, choose TAFE Queensland. If a degree plus automotive practice and future business management is the goal, choose the Unitec certificate plus bachelor route. If professional engineer status and later master study are the goal, choose the RMIT associate-to-bachelor pathway.",
    picks: pickName(anzP, anzPicks),
    answers: anzAnswers.slice(0, 6),
    cities: anzCities.slice(0, 6).map(mapCity),
    visa: {
      title: "Australia subclass 500 vs NZ fee-paying student",
      work: "Australia: generally up to 48 hours a fortnight in session. NZ: often up to 25 hours a week, plus full-time in eligible holidays. A Level 3 NZ certificate does not create a graduate work visa.",
      note: "Australian financial capacity benchmark A$29,710 living + tuition + travel. NZ tertiary living NZ$20,000/year. From 16 Nov 2026 NZ adds a 6-month Short Term Graduate Work Visa for certain Level 5–7 awards. Do not sell a Certificate/Diploma as the same graduate visa as a bachelor."
    }
  },
  {
    id: "eastasia",
    name: "Singapore, Japan, Korea, Taiwan",
    href: "../auto/",
    headline: "Finder coverage beyond the regional reports",
    firstChoice: "Use the Automotive study finder for NTU, NUS, SIT, ITE, Nagoya, KUAS, Kookmin, Woosong and Taiwan Tech — plus GCC and Pakistan agent contacts.",
    conclusion: "These destinations appear in the global finder, not in the Grade-12 regional decision reports. Confirm English medium, IELTS and 2027 intake directly with the school or listed agent.",
    picks: [],
    answers: [],
    cities: [],
    visa: {
      title: "Check each country separately",
      work: "Post-study work rules differ widely and are not summarised in the regional auto reports.",
      note: "The finder lists language mode, IELTS minimums, intakes and regional agents."
    }
  }
];

const hub = {
  meta: {
    title: "Automotive & vehicle degrees",
    updated: "13 September 2026",
    researchDate: "Regional reports dated 11 September 2026; CUCAS scrape 12 September 2026",
    profile: "Pakistani CBSE Grade 12 student living in Kuwait, 2027 intake",
    evidence: "If an official source does not confirm a fact, GoInfo marks it unverified or conditional. Fees, visas and English medium can change before enrolment.",
    counts: {
      programs: programs.length,
      countries: [...new Set(programs.map((p) => p.country).filter(Boolean))].length,
      guides: 8
    }
  },
  profile: Object.fromEntries(chinaProfile),
  howToUse: [
    { t: "Start here", d: "Filter the combined catalog by region, degree level, language and IELTS. Shortlist a few, then open the regional guide for fit check, costs and sources." },
    { t: "Prefer applied bachelors", d: "Across China, Malaysia, EU, UK/Ireland, USA and ANZ, the reports agree: an applied automotive bachelor usually beats both a purely theoretical mechanical degree and a short workshop certificate — unless the goal is specifically technician work." },
    { t: "Verify English and 2027 intake in writing", d: "An English website is not proof of English teaching. Get written confirmation of medium, fees, CBSE/Grade 12 entry and visa finances before paying a non-refundable fee." }
  ],
  paths: [
    { path: "Applied / automotive bachelor", bestFor: "Diagnostics, EV, service engineering, later master, future business", strength: "Keeps academic progression while staying practical", limitation: "Must confirm workshops, HV/EV content and English medium" },
    { path: "Engineering bachelor (BEng / Vehicle Engineering)", bestFor: "Design, R&D, professional engineer, master later", strength: "Stronger maths and systems", limitation: "Often more theoretical and more selective" },
    { path: "Engineering technology / applied technology", bestFor: "Testing, production, autotronics, service", strength: "Best practical/application balance in Malaysia and parts of the US", limitation: "Professional recognition differs from accredited engineering" },
    { path: "Diploma / higher vocational / TAFE / associate", bestFor: "Technician, workshop, diagnostics", strength: "Hands-on, often lower IELTS and cost", limitation: "Not the same as a bachelor; post-study work and master routes may be weaker" },
    { path: "2+2 / foundation / certificate-then-degree", bestFor: "Average Grade 12 marks or missing direct-entry prerequisites", strength: "Structured bridge into a bachelor", limitation: "Adds time and cost; confirm credit transfer in writing" }
  ],
  skills: chinaSkills,
  compare: chinaCountries.map((c) => ({
    country: c.n,
    tuition: c.tuition,
    living: c.living,
    english: c.english,
    industry: c.industry,
    visa: c.visa,
    verdict: c.verdict
  })),
  malaysiaCompare: mal.countries,
  malaysiaCosts: mal.costs,
  malaysiaCautions: mal.cautions,
  malaysiaTimeline: mal.timeline,
  questions: chinaQuestions,
  todo: chinaTodo,
  chinaPaths: chinaChinaPaths.map((p) => ({
    path: p[0],
    local: p[1],
    duration: p[2],
    content: p[3],
    strength: p[4],
    limitation: p[5]
  })),
  flags: chinaFlags.map((f) => ({ item: f[0], why: f[1] })),
  regions,
  programs,
  cucas: {
    scrapeDate: cucas.scrape_date,
    source: cucas.source,
    counts: cucas.counts,
    programs: cucas.programs,
    excluded: cucas.excluded_non_bachelor
  },
  finder: institutions.map((i) => ({
    id: i.id,
    name: i.name,
    country: i.country,
    type: i.type,
    location: i.location,
    language: i.language,
    ieltsMin: i.ieltsMin,
    specialties: i.specialties,
    requirements: i.requirements,
    intakes: i.intakes,
    deadlines: i.deadlines,
    ownership: i.ownership,
    url: i.url,
    agentsGCC: i.agentsGCC,
    agentsPK: i.agentsPK
  })),
  guides: [
    { href: "../auto/", name: "Automotive study finder", blurb: "30 schools, filters, shortlist, GCC and Pakistan agents." },
    { href: "../china-auto-guide/", name: "China auto & EV guide", blurb: "Ranked Top 15, fit check, costs, cities, 2027 apply plan." },
    { href: "../china-vehicle-engineering/", name: "China Vehicle Engineering (CUCAS)", blurb: "Bachelor listings with CUCAS URLs, fees and deadlines." },
    { href: "../malaysia-auto-guide/", name: "Malaysia auto & EV guide", blurb: "UniKL, UMPSA, UniMAP, UTHM, DRB-HICOM and cost tables." },
    { href: "../eu-auto-guide/", name: "EU / Schengen auto & EV", blurb: "Fontys, HAN, Metropolia, Hungary, language check." },
    { href: "../uk-ireland-auto-guide/", name: "UK & Ireland auto & EV", blurb: "Oxford Brookes, ATU, MTU, TU Dublin, Graduate visa note." },
    { href: "../usa-auto-guide/", name: "USA auto & EV guide", blurb: "SIU, 2+2 routes, F-1 / OPT / STEM OPT." },
    { href: "../australia-nz-auto-guide/", name: "Australia & NZ auto & EV", blurb: "TAFE Queensland, Unitec, RMIT pathways, subclass 500." }
  ]
};

const out = path.join(root, "automotive", "data.js");
const body = "window.AUTOMOTIVE_HUB = " + JSON.stringify(hub, null, 2) + ";\n";
fs.writeFileSync(out, body, "utf8");
console.log("Wrote", out);
console.log("programs", programs.length, "countries", hub.meta.counts.countries, "bytes", body.length);
console.log("by region", programs.reduce((a, p) => { a[p.region] = (a[p.region] || 0) + 1; return a; }, {}));
