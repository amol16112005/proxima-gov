/**
 * Generates PROXIMA_GOV_PROJECT_DOCUMENTATION.docx from project knowledge base.
 * Run: node devops/scripts/generate-project-doc.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  WidthType,
  BorderStyle,
  ShadingType,
  PageNumber,
  Header,
  Footer,
  TableOfContents,
  ExternalHyperlink,
  PageBreak,
} = require("docx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "PROXIMA_GOV_PROJECT_DOCUMENTATION.docx");

const CONTENT_WIDTH = 9360;
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: Array.isArray(text)
      ? text
      : [new TextRun({ text, size: 22, font: "Arial" })],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial" })],
    spacing: { before: 360, after: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial" })],
    spacing: { before: 280, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial" })],
    spacing: { before: 200, after: 120 },
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial" })],
  });
}

function linkPara(label, url) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: label, style: "Hyperlink", size: 22, font: "Arial" })],
      }),
    ],
  });
}

function table(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    children: headers.map((h, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: "1E3A5F", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Arial" })],
          }),
        ],
      })
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell, i) =>
          new TableCell({
            borders,
            width: { size: colWidths[i], type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial" })] })],
          })
        ),
      })
  );
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

const mpCreds = [
  ["Mumbai South", "Maharashtra", "mp.mumbai-south", "482910"],
  ["Pune City", "Maharashtra", "mp.pune-city", "573821"],
  ["New Delhi", "Delhi", "mp.new-delhi", "384729"],
  ["Bangalore South", "Karnataka", "mp.bangalore-south", "495830"],
  ["Chennai Central", "Tamil Nadu", "mp.chennai-central", "506941"],
  ["Hyderabad", "Telangana", "mp.hyderabad", "617052"],
  ["Kolkata South", "West Bengal", "mp.kolkata-south", "728163"],
  ["Ahmedabad East", "Gujarat", "mp.ahmedabad-east", "839274"],
  ["Lucknow", "Uttar Pradesh", "mp.lucknow", "940385"],
  ["Jaipur", "Rajasthan", "mp.jaipur", "151496"],
  ["Bhopal", "Madhya Pradesh", "mp.bhopal", "262507"],
  ["Patna Sahib", "Bihar", "mp.patna-sahib", "373618"],
  ["Ernakulam", "Kerala", "mp.ernakulam", "484729"],
  ["Guwahati", "Assam", "mp.guwahati", "595830"],
  ["Amritsar", "Punjab", "mp.amritsar", "606941"],
];

const children = [
  // Cover
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "Proxima Gov", bold: true, size: 56, font: "Arial", color: "1E3A5F" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "Digital Governance Initiative for Lok Sabha Constituencies",
        size: 28,
        font: "Arial",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Complete Project Documentation", size: 24, font: "Arial", italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Government of India · Lok Sabha · Digital India", size: 22, font: "Arial" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "FY 2026–27", size: 22, font: "Arial" })],
  }),
  linkPara("Live demo: https://proxima-gov.vercel.app", "https://proxima-gov.vercel.app"),
  linkPara("GitHub: https://github.com/amol16112005/proxima-gov", "https://github.com/amol16112005/proxima-gov"),
  new Paragraph({ children: [new PageBreak()] }),

  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] }),

  // 1. Executive Summary
  h1("1. Executive Summary"),
  p(
    "Proxima Gov is a citizen-first digital governance platform for Lok Sabha constituencies in India. It bridges residents who report local development problems and Members of Parliament who approve, execute, and are held accountable for constituency work — especially projects funded through MPLADS (Members of Parliament Local Area Development Scheme)."
  ),
  p(
    "The name Proxima reflects proximity: bringing government closer to the people through real-time visibility, structured workflows, and measurable outcomes — not a distant grievance box, but an end-to-end governance lifecycle."
  ),
  p(
    "This document consolidates all project documentation (README, PROBLEM_STATEMENT, ARCHITECTURE, LIFECYCLE, API, SETUP, DEPLOYMENT, CONSTRUCTION, and developer credentials) into a single reference for judges, stakeholders, developers, and operators."
  ),

  h2("1.1 What Proxima Gov Stands For"),
  table(
    ["Principle", "Meaning"],
    [
      ["Transparency", "Budgets, timelines, progress photos, and stage updates visible to citizens and the public"],
      ["Accountability", "MPs act on citizen-verified work; disputed completions trigger review"],
      ["Proximity", "Constituency-scoped access — citizens see their MP, seat, and local issues"],
      ["Security", "OTP citizen auth; separate MP portal with constituency username + PIN"],
      ["Inclusivity", "Hindi UI, larger text, high contrast, read-aloud via accessibility toolbar"],
      ["Intelligence", "AI triages issues for jurisdiction and priority before MP desk"],
    ],
    [2800, 6560]
  ),
  p(""),

  h2("1.2 Live Resources"),
  bullet("Production site: https://proxima-gov.vercel.app"),
  bullet("Health check: https://proxima-gov.vercel.app/api/health"),
  bullet("Public FAQ: https://proxima-gov.vercel.app/faq"),
  bullet("Transparency: https://proxima-gov.vercel.app/transparency"),
  bullet("Source code: https://github.com/amol16112005/proxima-gov"),

  new Paragraph({ children: [new PageBreak()] }),

  // 2. Problem Statement
  h1("2. Problem Statement"),
  p(
    "Lok Sabha constituencies span hundreds of millions of citizens, yet most residents have no structured digital channel to report local development needs or track whether their Member of Parliament acted on them. MPLADS and related schemes fund roads, schools, and health infrastructure — but visibility and accountability remain fragmented."
  ),
  h2("2.1 Core Problems"),
  table(
    ["Challenge", "How Proxima Gov Addresses It"],
    [
      ["Citizen disconnection", "Constituency-scoped portal with project registry, transparency dashboard, issue lifecycle"],
      ["Wrong-channel grievances", "AI jurisdiction triage declines out-of-scope issues with referral guidance"],
      ["No accountability loop", "Closed-loop: MP approval → contractor → photos → citizen verification → impact"],
      ["MP operational blind spots", "MP dashboard with pending approvals, delay alerts, mandatory completion photos"],
      ["Trust deficit", "Public transparency pages, audit trail, bilingual FAQ"],
    ],
    [3200, 6160]
  ),
  p(""),

  h2("2.2 Success Criteria"),
  table(
    ["Stakeholder", "Expected Outcome"],
    [
      ["Citizen", "Submit eligible issues, track status, verify completed work"],
      ["MP", "Approve triaged issues, upload progress photos, act on delays"],
      ["Public / judges", "Audit transparency data and understand the governance loop"],
      ["Platform", "Secure, tested, accessible, aligned with Digital India / Lok Sabha mandate"],
    ],
    [2800, 6560]
  ),
  p(""),

  new Paragraph({ children: [new PageBreak()] }),

  // 3. Core Capabilities
  h1("3. Core Capabilities & Portals"),
  h2("3.1 Citizen Portal (/citizen/*)"),
  bullet("Registration and OTP login (no password required)"),
  bullet("Dashboard with constituency projects, MPLADS summaries, and MP profile"),
  bullet("Issue submission with AI jurisdiction scan — all citizen concerns filed as Issues"),
  bullet("Notifications, activity history, and profile (including constituency change)"),
  bullet("Citizen verification of completed work (yes/no vote)"),

  h2("3.2 MP Portal (/mp/*)"),
  bullet("PIN-secured login per parliamentary seat (one seat = one account)"),
  bullet("Pending approvals queue (eligible issues only — declined never appear)"),
  bullet("Per-issue actions: approve → assign → tender → start work → progress → photos → review"),
  bullet("Mandatory progress and completion photo uploads"),
  bullet("Accountability actions: approve closure, reopen contractor, escalate officer, re-inspect"),

  h2("3.3 Public Pages"),
  bullet("Home (/) — marketing, constituency list, portal chooser"),
  bullet("FAQ (/faq) — bilingual help for citizens, MPs, and judges"),
  bullet("Transparency (/transparency) — public lifecycle and project visibility"),
  bullet("Problem Statement (/problem) — hackathon context"),

  h2("3.4 Portal URLs & Authentication"),
  table(
    ["Portal", "URL", "Auth"],
    [
      ["Home", "/", "Public"],
      ["FAQs", "/faq", "Public"],
      ["Citizen Register", "/citizen/register", "OTP"],
      ["Citizen Login", "/citizen/login", "OTP"],
      ["Citizen Dashboard", "/citizen/dashboard", "Session"],
      ["Submit Issue", "/citizen/issues/new", "Session"],
      ["MP Login", "/mp/login", "Username + 6-digit PIN"],
      ["MP Dashboard", "/mp/dashboard", "Session"],
      ["Transparency", "/transparency", "Public"],
    ],
    [2400, 3600, 3360]
  ),
  p(""),
  p(
    "Important: Citizen and MP portals use separate sessions. Only one can be active at a time — log out before switching portals. Middleware enforces this on protected routes."
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // 4. Governance Lifecycle
  h1("4. Governance Lifecycle"),
  p(
    "Every eligible Issue follows a closed loop: Submit → AI Analysis → MP Approval → Work Assigned → Tender Released → Work Started → In Progress (photos) → Citizen Verification → MP Review & Accountability → Completed → Impact Analysis."
  ),

  h2("4.1 Issues vs Grievances"),
  p(
    "Citizen-facing flow: all new concerns are filed as Issues via Submit Issue. Legacy URLs /citizen/grievances redirect to the Issues list. The /api/grievances API remains for backward compatibility; Activity History may label older entries as Grievance."
  ),

  h2("4.2 Lifecycle Stages"),
  table(
    ["Stage", "Label", "Who Acts", "On MP Dashboard?"],
    [
      ["submitted", "Submitted", "Citizen", "No"],
      ["ai-analysis", "AI Analysis", "System", "Only if eligible"],
      ["declined", "Not Taken Up", "System (auto)", "Never"],
      ["mp-approval", "Awaiting MP Approval", "MP", "Yes"],
      ["approved", "Approved", "MP", "Yes"],
      ["work-assigned", "Work Assigned", "MP", "Yes"],
      ["tender-released", "Tender Released", "MP", "Yes"],
      ["work-started", "Work Started", "MP", "Yes"],
      ["in-progress", "In Progress", "MP", "Yes"],
      ["citizen-verification", "Citizen Verification", "Citizen", "Waiting"],
      ["mp-review", "MP Review", "MP", "Yes"],
      ["completed", "Completed", "MP", "Yes"],
      ["impact-analysis", "Impact Analysis", "System", "Yes"],
    ],
    [2200, 2200, 2200, 2760]
  ),
  p(""),

  h2("4.3 AI Jurisdiction Triage"),
  p("AI runs before the MP sees any issue. Module: backend/lib/issueTriage.ts"),
  table(
    ["Verdict", "Examples", "Outcome"],
    [
      ["eligible", "Local road/water/school in constituency", "Forwarded to MP dashboard"],
      ["out-of-constituency", "Location names another seat", "Declined; referral to that MP"],
      ["wrong-authority", "Police, electricity, municipal tax", "Declined; state/local body referral"],
      ["not-mp-mandate", "Passport, tax, personal job plea", "Declined; ministry/portal referral"],
    ],
    [2200, 3600, 3560]
  ),
  p(""),

  h2("4.4 Photo Requirements"),
  bullet("At least one progress photo (isCompletion: false) before marking work complete"),
  bullet("At least one completion photo (isCompletion: true) — after-work evidence"),
  bullet("Photos stored as base64 data URLs in issue documents (demo); production would use object storage"),
  bullet("Rules enforced in backend/lib/lifecycleRules.ts"),

  h2("4.5 MP Review Decisions"),
  table(
    ["Decision", "Effect"],
    [
      ["approve-closure", "Close issue, publish impact analysis"],
      ["reopen-contractor", "Send work back to contractor"],
      ["escalate-officer", "Escalate supervising officer"],
      ["reject-reinspect", "Order quality re-inspection"],
    ],
    [4000, 5360]
  ),
  p(""),

  new Paragraph({ children: [new PageBreak()] }),

  // 5. Architecture
  h1("5. System Architecture"),
  p(
    "Proxima Gov is a monolithic Next.js 16 application using the App Router. A single Node.js process serves server-rendered React pages, REST API routes under /api/*, and Edge middleware for session-based route protection. Business logic lives in backend/lib/; UI in frontend/; routing glue in app/."
  ),

  h2("5.1 Architectural Layers"),
  table(
    ["Layer", "Location", "Responsibility"],
    [
      ["Routing", "app/", "URL → page or API handler"],
      ["Presentation", "frontend/components/, frontend/styles/", "React UI, lifecycle visualisation"],
      ["Application", "backend/lib/", "Lifecycle, triage, notifications, sessions"],
      ["Domain data", "backend/data/", "Constituencies, seed issues, FAQs"],
      ["Infrastructure", "backend/lib/cloud/", "SQLite/MongoDB hydrate, persist, activity log"],
      ["Integration", "backend/lib/datagovindia/, backend/lib/ai/", "data.gov.in, Gemini AI"],
      ["Cross-cutting", "middleware.ts", "Auth gate for /citizen/* and /mp/*"],
    ],
    [1800, 2800, 4760]
  ),
  p(""),

  h2("5.2 Authentication"),
  bullet("Session cookie: proxima_session (HMAC-SHA256 signed JSON, 7-day max age)"),
  bullet("SESSION_SECRET env var — 32+ characters, required in production"),
  bullet("Citizen: POST /api/auth/send-otp → POST /api/auth/verify-otp"),
  bullet("MP: POST /api/auth/mp-login (username + PIN from mpRegistry.ts)"),
  bullet("Edge parsing: backend/lib/auth/session-edge.ts (middleware)"),
  bullet("Node parsing: backend/lib/auth/session.ts (API routes, server components)"),

  h2("5.3 Storage"),
  table(
    ["Mode", "Configuration", "Behaviour"],
    [
      ["SQLite (default local)", "No MONGODB_URI", "File: backend/data/proxima.sqlite"],
      ["MongoDB Atlas", "MONGODB_URI + MONGODB_DB", "Cloud persistence (required on Vercel)"],
      ["Memory", "PROXIMA_STORAGE=off", "Demo only — data lost on restart"],
    ],
    [2200, 2800, 4360]
  ),
  p(""),
  p("MongoDB collections: citizens, issues, grievances, notifications, activity_log, meta."),

  h2("5.4 Project Structure"),
  bullet("app/ — Next.js routes (pages + API entry points)"),
  bullet("frontend/components/ — React UI including lifecycle, FAQ, accessibility toolbar"),
  bullet("frontend/context/ — AccessibilityContext (locale, a11y prefs, read-aloud)"),
  bullet("frontend/i18n/ — English + Hindi message catalogs (~470 keys each)"),
  bullet("backend/data/ — Constituencies, seed issues, FAQs (en + hi)"),
  bullet("backend/lib/ — Business logic, auth, cloud storage, AI triage"),
  bullet("middleware.ts — Route protection for citizen and MP dashboards"),

  new Paragraph({ children: [new PageBreak()] }),

  // 6. Accessibility & i18n
  h1("6. Accessibility & Internationalisation"),
  p(
    "Proxima Gov includes built-in accessibility features via a round blue–purple floating action button (FAB) fixed at the bottom-left of every page. This is not the ♿ emoji — it is a circular button with a white accessibility icon."
  ),
  h2("6.1 Accessibility Panel Controls"),
  table(
    ["Control", "Function"],
    [
      ["English / हिन्दी", "Switches entire portal UI language; choice persisted in cookie + localStorage"],
      ["Larger text", "Increases base font size across the portal"],
      ["High contrast", "Black background, white text, underlined links"],
      ["Read page aloud", "Browser TTS in chunks (hi-IN / en-IN); full page, not truncated at 4000 chars"],
    ],
    [3200, 6160]
  ),
  p(""),
  bullet("Skip link: Skip to main content"),
  bullet("Offline banner: shown only after /api/health check fails or browser offline event"),
  bullet("Hindi typography: Noto Sans Devanagari + hindi-locale.css"),
  bullet("FAQ help: /faq#faq-accessibility (English and Hindi content)"),

  h2("6.2 i18n Architecture"),
  bullet("Server pages: getServerTranslator() reads proxima_locale cookie"),
  bullet("Client components: useAccessibility().translate()"),
  bullet("Root layout passes initialLocale to AccessibilityProvider (prevents Hindi flash)"),
  bullet("Placeholder strings: interpolate(t('key'), { name: value })"),
  bullet("Key parity enforced by frontend/i18n/index.test.ts"),

  new Paragraph({ children: [new PageBreak()] }),

  // 7. API Reference
  h1("7. API Reference (Summary)"),
  p("REST JSON API served from app/api/. Session cookie proxima_session sent automatically by browser."),

  h2("7.1 Authentication Endpoints"),
  table(
    ["Method", "Endpoint", "Description"],
    [
      ["POST", "/api/auth/send-otp", "Send OTP to mobile (demo may return OTP in body)"],
      ["POST", "/api/auth/verify-otp", "Verify OTP / register / login citizen"],
      ["POST", "/api/auth/mp-login", "MP username + PIN login"],
      ["POST", "/api/auth/logout", "Clear session cookie"],
      ["GET", "/api/auth/me", "Current session user or null"],
    ],
    [1200, 3600, 4560]
  ),
  p(""),

  h2("7.2 Issue Endpoints"),
  table(
    ["Method", "Endpoint", "Description"],
    [
      ["GET", "/api/issues", "List issues (public=true for transparency)"],
      ["POST", "/api/issues", "Create issue (citizen; AI triage applied)"],
      ["GET", "/api/issues/[id]", "Issue detail"],
      ["PATCH", "/api/issues/[id]", "MP actions: approve, assign, tender, start, progress, addImage, mpReview"],
      ["POST", "/api/issues/[id]/verify", "Citizen verification vote (yes/no)"],
    ],
    [1200, 3200, 4960]
  ),
  p(""),

  h2("7.3 Other Endpoints"),
  table(
    ["Method", "Endpoint", "Description"],
    [
      ["GET/POST", "/api/grievances", "Legacy grievance API"],
      ["GET", "/api/notifications", "Citizen notifications"],
      ["POST", "/api/notifications", "Mark read / mark all read"],
      ["GET", "/api/history", "Activity audit trail"],
      ["PATCH", "/api/citizen/profile", "Change constituency"],
      ["GET", "/api/cloud/status", "Storage provider status"],
      ["GET", "/api/health", "Service health + sessionSecretConfigured"],
      ["GET", "/api/datagov/projects", "Live scheme projects"],
      ["GET", "/api/datagov/mp-report", "MP transparency report"],
    ],
    [1200, 3200, 4960]
  ),
  p(""),

  new Paragraph({ children: [new PageBreak()] }),

  // 8. Setup & Development
  h1("8. Setup & Development"),
  h2("8.1 Prerequisites"),
  bullet("Node.js 18+ (20 recommended), npm 9+"),
  bullet("Git (optional), MongoDB Atlas (optional for cloud persistence)"),
  bullet("Windows: use npm.cmd run dev if PowerShell blocks npm scripts"),

  h2("8.2 Quick Start"),
  p("git clone https://github.com/amol16112005/proxima-gov.git"),
  p('cd proxima-gov && npm install && npm run dev'),
  p("Open http://localhost:3000"),

  h2("8.3 Environment Variables"),
  table(
    ["Variable", "Required", "Description"],
    [
      ["MONGODB_URI", "Vercel: Yes", "MongoDB connection string"],
      ["MONGODB_DB", "Vercel: Yes", "Database name (proxima_gov)"],
      ["SESSION_SECRET", "Production: Yes", "32+ char random string for session signing"],
      ["NEXT_PUBLIC_GEMINI_API_KEY", "No", "Gemini AI for grievance responses"],
      ["DATAGOVINDIA_API_KEY", "No", "data.gov.in open data"],
      ["PROXIMA_STORAGE", "No", "Set off for memory-only demo"],
    ],
    [2800, 1800, 4760]
  ),
  p(""),

  h2("8.4 NPM Scripts"),
  table(
    ["Command", "Description"],
    [
      ["npm run dev", "Start dev server (Turbopack)"],
      ["npm run build", "Production build"],
      ["npm run build:clean", "Delete .next cache, then build"],
      ["npm start", "Run production server"],
      ["npm run test", "Vitest unit tests (39 tests)"],
      ["npm run test:e2e", "Playwright E2E tests"],
      ["npm run lint", "ESLint"],
      ["npm run verify:storage", "Test SQLite or MongoDB connection"],
      ["npm run deploy:vercel", "Deploy to Vercel production"],
    ],
    [3600, 5760]
  ),
  p(""),

  h2("8.5 Smoke Test Checklist"),
  bullet("Citizen register + OTP login"),
  bullet("Submit eligible issue + declined issue (wrong jurisdiction)"),
  bullet("MP login → approve → upload progress + completion photos"),
  bullet("Citizen verification vote"),
  bullet("Wrong-portal logout notice"),
  bullet("FAQ in English and Hindi"),
  bullet("Accessibility panel: language, large text, high contrast, read-aloud"),
  bullet("/transparency public view"),

  new Paragraph({ children: [new PageBreak()] }),

  // 9. Deployment
  h1("9. Deployment"),
  h2("9.1 Vercel (Recommended Production)"),
  bullet("Import github.com/amol16112005/proxima-gov at vercel.com/new"),
  bullet("Set MONGODB_URI, MONGODB_DB, SESSION_SECRET (all required)"),
  bullet("Region: Mumbai (bom1) via vercel.json"),
  bullet("Verify: /api/health returns status ok and sessionSecretConfigured true"),
  bullet("After fixes: Redeploy without build cache, hard-refresh browser"),

  h2("9.2 Hosting Options"),
  table(
    ["Platform", "Suitability", "Notes"],
    [
      ["Vercel", "UI demo + production", "Serverless; MongoDB required; SQLite not supported"],
      ["Railway / Render / Fly.io", "Full-stack", "Persistent disk or MongoDB Atlas"],
      ["VPS (Ubuntu)", "Best control", "PM2 + Nginx reverse proxy"],
      ["Docker", "Portable", "docker-compose.yml with MongoDB volume"],
    ],
    [2200, 2200, 4960]
  ),
  p(""),

  h2("9.3 Security Before Public Launch"),
  bullet("Rotate all demo MP PINs"),
  bullet("Remove OTP from API responses"),
  bullet("Enable HTTPS only"),
  bullet("Set strong SESSION_SECRET (no demo fallback in production)"),
  bullet("Restrict MongoDB Atlas IP whitelist"),
  bullet("Pen-test auth and IDOR on /api/issues/[id]"),
  bullet("Cap image upload size at reverse proxy"),

  h2("9.4 Constituency Rollout Plan"),
  table(
    ["Phase", "Timeline", "Scope"],
    [
      ["Pilot", "Week 1–2", "1 Lok Sabha seat"],
      ["District cluster", "Week 3–6", "5–10 neighbouring seats"],
      ["State", "Month 2–3", "All seats in one state"],
      ["National", "Month 4+", "543 constituencies"],
    ],
    [2200, 2200, 4960]
  ),
  p(""),

  new Paragraph({ children: [new PageBreak()] }),

  // 10. MP Demo Credentials
  h1("10. MP Demo Credentials"),
  p(
    "Restricted document for hackathon developers, judges, and demo operators. Usernames are tied to Lok Sabha parliamentary constituencies. MP names are from the 18th Lok Sabha (2024). Log in at /mp/login."
  ),
  table(["Constituency", "State", "Username", "PIN"], mpCreds, [2400, 2000, 2800, 2160]),
  p(""),
  p("Quick demo — Bangalore South: Username mp.bangalore-south, PIN 495830"),

  new Paragraph({ children: [new PageBreak()] }),

  // 11. Constituencies
  h1("11. Constituencies Covered"),
  p(
    "The demo ships with 15 Lok Sabha constituencies across Indian states. Each includes MP profile, party, sample government projects, and constituency-scoped dashboards. Data source: backend/data/constituencies.ts."
  ),
  bullet("Mumbai South, Pune City, New Delhi, Bangalore South, Chennai Central"),
  bullet("Hyderabad, Kolkata South, Ahmedabad East, Lucknow, Jaipur"),
  bullet("Bhopal, Patna Sahib, Ernakulam, Guwahati, Amritsar"),

  // 12. Tech Stack
  h1("12. Technology Stack"),
  table(
    ["Layer", "Technology"],
    [
      ["Framework", "Next.js 16 (App Router, Turbopack)"],
      ["UI", "React 19, CSS Modules"],
      ["Language", "TypeScript"],
      ["Persistence", "SQLite (local) or MongoDB Atlas (cloud/Vercel)"],
      ["AI", "Google Gemini (@google/generative-ai)"],
      ["Open data", "data.gov.in APIs"],
      ["Auth", "HMAC-signed session cookies; OTP (demo); MP PIN"],
      ["Testing", "Vitest (unit), Playwright (E2E)"],
      ["Hosting", "Vercel (bom1), Docker, VPS"],
    ],
    [2800, 6560]
  ),
  p(""),

  // 13. Disclaimer
  h1("13. Disclaimer"),
  p(
    "Proxima Gov is a demonstration platform for digital governance concepts (hackathons, academic projects, and stakeholder demos). It is inspired by Government of India / Lok Sabha / Digital India themes but is not an official government production system unless separately commissioned and deployed."
  ),
  p(
    "MP names and roster data reference the 18th Lok Sabha (2024) for realism. Credentials in this document and DEVELOPER_MP_CREDENTIALS.md are for demo use only."
  ),

  h2("13.1 Source Documentation Files"),
  bullet("README.md — Overview and quick start"),
  bullet("PROBLEM_STATEMENT.md — Hackathon problem and success criteria"),
  bullet("ARCHITECTURE.md — System design"),
  bullet("LIFECYCLE.md — Issue state machine"),
  bullet("API.md — REST endpoint reference"),
  bullet("SETUP.md — Installation and troubleshooting"),
  bullet("DEPLOYMENT.md — Hosting and Vercel guide"),
  bullet("CONSTRUCTION.md — Code organisation and extension guide"),
  bullet("DEVELOPER_MP_CREDENTIALS.md — MP demo logins"),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 140, after: 140 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Proxima Gov — Project Documentation",
                  size: 18,
                  font: "Arial",
                  color: "64748B",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Page ", size: 18, font: "Arial" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial" }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT, buffer);
console.log(`Generated: ${OUT}`);
console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);