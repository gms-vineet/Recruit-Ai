// utils/dummyCandidates.js

// Pretty date helpers (kept)
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// === NEW: Your resume & JD text ===
export const RESUME_ABHISHEK = `Abhishek Salokhe
abhishek.salokhe.9294@gmail.com | 8767977069 | https://abhisheksalokheportfolio.netlify.app/
linkedin.com/in/abhishek-salokhe | github.com/AbhishekSalokhe24

Technical Skills
Programming Languages: JavaScript, TypeScript, C++, SQL, HTML, CSS, Object Oriented Programming
Frameworks/Libraries: Angular 14+, NgRx, React JS, React Native, Redux Toolkit, Tailwind CSS, PrimeNG, Material UI
Testing: Unit Testing in Angular, Test-Driven Development (TDD)
Version Control: Git, GitHub
Backend: Node JS, Express JS, MySQL
Tools: VS Code, Postman, Figma, Firebase, Netlify, JIRA

Experience
Software Engineer, GetMy Solutions Pvt Ltd – Pune, Maharashtra
April 2024 – Present
• Spearheaded the development of a cross-platform Vehicle Management Mobile App in React Native, compatible with both Android and iOS...
• Developed an advanced mobile application that streamlined vehicle management processes...
• Championed the design and implementation of an Organization Management System in Angular...
• Engineered a Software-Defined Vehicle website using Angular, PrimeNG, and REST APIs...

Frontend Developer Intern, Trooman Technologies – Pune, Maharashtra
February 2023 – April 2023
• Crafted and deployed an intuitive frontend for a Hospital Management Website leveraging React JS...
• Managed efficient state handling, achieving a 30% improvement in performance through Redux Toolkit...
• Created interactive prototypes via Figma demonstrating new UI features for stakeholders...

Education
Ajeenkya D Y Patil School of Engineering, Pune, B.E. Computer Engineering
February 2020 – June 2024 • CGPA: 8.99 / 10

Projects
Movies Mobile App (React Native, Redux Toolkit) — ... 
E-commerce Website (Angular 17, Node, Express) — ...
Project Management Tool (HTML/CSS/JS, Frappe) — ...
`;

export const JD_TATA_FRONTEND = `**Frontend Developer — TATA**

**About TATA**  
TATA is a leading electric vehicle company shaping the future of sustainable mobility...

**Role Overview**  
We are seeking a dedicated Frontend Developer to join our remote team while based in Pune...

**Key Responsibilities**
- Design, develop, and maintain reusable UI components in React.js.
- Translate design mockups into pixel-perfect, accessible pages...
- Ensure cross-browser and cross-device compatibility...
- Optimize component performance and bundle sizes...
- Implement responsive layouts...
- Collaborate with UX designers...
- Conduct code reviews...
- Troubleshoot and resolve production bugs...

**Required Qualifications**
- 2–3 years of professional frontend development experience.
- Proficiency in HTML, CSS, and JavaScript.
- Strong command of React.js and its core principles.
- Solid understanding of responsive design...
- Experience with build tools (Webpack/Vite) and Git...
- Excellent problem-solving...
- Effective communication...
- Commitment to clean, tested code.

**Preferred Qualifications**
- Redux/Context API, Sass/LESS or CSS-in-JS, Jest/RTL, Accessibility & Perf.

**Tools & Technologies**  
HTML, CSS, JavaScript, React.js
`;

// Map old/new shapes into what ResumeViewer needs
function toResumeViewerSchema(x) {
  const full_name = x.candidate?.name ?? x.full_name ?? "—";
  const email = x.candidate?.email ?? x.email ?? "";
  const phone = x.candidate?.phone ?? x.phone ?? "";

  return {
    // identifiers
    id: x.id,
    candidate_id: x.id,

    // identity
    full_name,
    email,
    phone,

    // interview info
    role: x.role,
    status: x.status,
    start: x.start,
    end: x.end,
    meetLink: x.meetLink,
    resumeUrl: x.resumeUrl,
    notes: x.notes,

    // NEW: attach raw resume/JD so ResumeViewer can render them
    resume_raw: x.resume_raw || "",
    jd_raw: x.jd_raw || "",

    // chips
    overall_score: x.overall_score ?? 65.2,
    jd_match_score: x.jd_match_score ?? 72.4,
    skill_match_score: x.skill_match_score ?? 68.0,
    experience_match_score: x.experience_match_score ?? 80.0,
    meta: x.meta ?? { total_experience_years: 4 },

    // tiny demo data
    skills: x.skills || {
      languages: ["JavaScript"],
      frameworks: ["React"],
      tools: ["Git"],
      databases: ["PostgreSQL"],
      soft_skills: ["Communication"],
    },
    experience: x.experience || [
      {
        title: "Software Engineer",
        company: "Acme Corp",
        start_date: "Jan 2022",
        end_date: "Present",
        description: "Feature work, code reviews, performance fixes.",
        technologies: ["React", "Node.js"],
      },
    ],
    education: x.education || [
      { degree: "B.Tech (CS)", institution: "Tech University", start_year: 2016, end_year: 2020 },
    ],
    projects: x.projects || [],

    // AI summary
    ai_summary:
      x.ai_summary ??
      `### Overview
- **Candidate:** ${full_name}
- **Role:** ${x.role ?? "—"}
- **Status:** ${x.status ?? "—"}
- **Interview:** ${fmtDate(x.start)} ${fmtTime(x.start)} – ${fmtTime(x.end)}`
  };
}

export function buildDummyCandidates() {
  const now = new Date();
  const mk = (h, m, id, name, role, extras = {}) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    const raw = {
      id,
      candidate: {
        name,
        email: `${name.split(" ")[0].toLowerCase()}@example.com`,
        phone: "+91 98765 12345",
      },
      role,
      start: start.toISOString(),
      end: end.toISOString(),
      status: "Scheduled",
      meetLink: "https://meet.google.com/abc-defg-hij",
      resumeUrl: "https://example.com/resume.pdf",
      notes: "Focus on HAL & CarService integration.",
      ...extras,
    };
    return toResumeViewerSchema(raw);
  };

  // INT-001 uses your real resume & JD
  const c1 = mk(
    11, 0, "INT-001",
    "Abhishek Salokhe",
    "Frontend Developer — TATA",
    {
      resume_raw: RESUME_ABHISHEK,
      jd_raw: JD_TATA_FRONTEND,
      overall_score: 78.4,
      jd_match_score: 82.0,
      skill_match_score: 76.0,
      experience_match_score: 80.0,
      meta: { total_experience_years: 2.5 },
      notes: "Frontend (React/Angular). Emphasize React, testing & performance."
    }
  );

  // Keep a couple more demo entries
  const c2 = mk(15, 30, "INT-002", "Sara Khan", "AAOS Platform Engineer");
  const c3 = mk(17, 0,  "INT-003", "Rahul Verma", "Infotainment Middleware Engineer");

  return [c1, c2, c3];
}

export function getCandidateById(id) {
  return buildDummyCandidates().find((c) => String(c.id) === String(id)) || null;
}
