// utils/dummyCandidates.js
// Re-use the same list everywhere so clicks land on the same person
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function toResumeViewerSchema(x) {
  // Convert old shape -> viewer shape
  const full_name = x.candidate?.name ?? x.full_name ?? "—";
  const email = x.candidate?.email ?? x.email ?? "";
  const phone = x.candidate?.phone ?? x.phone ?? "";

  return {
    // identifiers
    id: x.id,
    candidate_id: x.id,

    // top-level identity
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

    // minimal meta so chips render nicely
    overall_score: 65.2,
    jd_match_score: 72.4,
    skill_match_score: 68.0,
    experience_match_score: 80.0,
    meta: { total_experience_years: 4 },

    // tiny skill/experience samples (can be empty arrays too)
    skills: {
      languages: ["JavaScript"],
      frameworks: ["React"],
      tools: ["Git"],
      databases: ["PostgreSQL"],
      soft_skills: ["Communication"],
    },
    experience: [
      {
        title: "Software Engineer",
        company: "Acme Corp",
        start_date: "Jan 2022",
        end_date: "Present",
        description: "Feature work, code reviews, and performance fixes.",
        technologies: ["React", "Node.js"],
      },
    ],
    education: [
      {
        degree: "B.Tech (CS)",
        institution: "Tech University",
        start_year: 2016,
        end_year: 2020,
      },
    ],
    projects: [],

    // AI summary so the section isn’t empty
    ai_summary:
      x.ai_summary ??
      `### Overview
- **Candidate:** ${full_name}
- **Role:** ${x.role ?? "—"}
- **Status:** ${x.status ?? "—"}
- **Interview:** ${fmtDate(x.start)} ${fmtTime(x.start)} – ${fmtTime(x.end)}`,
  };
}

export function buildDummyCandidates() {
  const now = new Date();
  const mk = (h, m, id, name, role) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    // keep your previous fields and let the mapper normalize them
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
    };
    return toResumeViewerSchema(raw);
  };

  return [
    mk(11, 0,  "INT-001", "Aarav Mehta", "Android Automotive HMI Engineer"),
    mk(15, 30, "INT-002", "Sara Khan",   "AAOS Platform Engineer"),
    mk(17, 0,  "INT-003", "Rahul Verma", "Infotainment Middleware Engineer"),
  ];
}

export function getCandidateById(id) {
  return buildDummyCandidates().find((c) => String(c.id) === String(id)) || null;
}
