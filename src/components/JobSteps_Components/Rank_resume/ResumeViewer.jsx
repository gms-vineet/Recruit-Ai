// src/pages/ResumeViewer.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PreflightModal from "@/components/Modal/PreflightModal";
import { useSelector } from "react-redux";

/** —— simple renderer for the AI summary —— */
const RenderAISummary = ({ text }) => {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/);
  return (
    <div className="space-y-1 text-sm text-slate-800 dark:text-slate-100">
      {lines.map((line, i) => {
        const raw = line ?? "";
        const trimmed = raw.trim();
        if (!trimmed) return <div key={i} className="h-3" />;
        if (/^#{3}\s*/.test(trimmed)) {
          return (
            <div key={i} className="font-bold">
              {trimmed.replace(/^#{3}\s*/, "")}
            </div>
          );
        }
        let m =
          trimmed.match(/^\-\s*\*\*(.+?)\*\*(.*)$/) ||
          trimmed.match(/^\-\*\*(.+?)\*\*(.*)$/);
        if (m) {
          return (
            <div key={i}>
              <span className="mr-2">•</span>
              <span className="font-bold">{m[1]}</span>
              <span>{m[2]}</span>
            </div>
          );
        }
        m = trimmed.match(/^\-\s*\*\*(.+)$/) || trimmed.match(/^\-\*\*(.+)$/);
        if (m) {
          return (
            <div key={i}>
              <span className="mr-2">•</span>
              <span className="font-bold">{m[1]}</span>
            </div>
          );
        }
        m = trimmed.match(/^\*\*(.+?)\*\*(.*)$/);
        if (m) {
          return (
            <div key={i}>
              <span className="font-bold">{m[1]}</span>
              <span>{m[2]}</span>
            </div>
          );
        }
        if (/^\*\*/.test(trimmed)) {
          return (
            <div key={i} className="font-bold">
              {trimmed.replace(/^\*\*\s*/, "")}
            </div>
          );
        }
        return <div key={i}>{raw}</div>;
      })}
    </div>
  );
};

export default function ResumeViewer({ data }) {
  const rows = useMemo(
    () => (Array.isArray(data) ? data : data?.rows || []),
    [data]
  );
  const [selectedIndex] = useState(rows.length ? 0 : -1);
  const selected = selectedIndex >= 0 ? rows[selectedIndex] : null;

  const [showPreflight, setShowPreflight] = useState(false);
  const me = useSelector((s) => s?.auth?.me);
  const interviewerName = me?.interviewer?.name || "Interviewer";

  useNavigate(); // kept for parity if you wire navigation later

  const getName = (c) =>
    c?.full_name ||
    [c?.first_name, c?.last_name].filter(Boolean).join(" ") ||
    c?.email ||
    "Unknown";

  const SectionTitle = ({ children }) => (
    <h3 className="mt-3 mb-2 text-md font-semibold tracking-wider text-slate-500 dark:text-slate-400">
      {String(children).toUpperCase()}
    </h3>
  );

  const Panel = ({ children }) => (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </section>
  );

  const Chip = ({ children }) => (
    <span className="text-sm font-semibold inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      {children}
    </span>
  );

  const RowItem = ({ label, value }) =>
    value ? (
      <div className="flex gap-3 py-1">
        <div className="w-28 text-xs text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-sm text-slate-700 dark:text-slate-100">{value}</div>
      </div>
    ) : null;

  const ScoreChips = ({ c }) => {
    const list = [];
    const add = (label, val) => typeof val === "number" && list.push({ label, val });
    add("Overall", c?.overall_score);
    add("Skill match", c?.skill_match_score ?? c?.meta?.skill_match_score);
    add("Experience match", c?.experience_match_score ?? c?.meta?.experience_match_score);
    add("JD match", c?.jd_match_score ?? c?.meta?.jd_match_score);
    if (!list.length) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {list.map((x) => (
          <Chip key={x.label}>
            {x.label}: {x.val} %
          </Chip>
        ))}
      </div>
    );
  };

  if (!selected) {
    return (
      <div className="grid h-[85vh] place-items-center rounded-xl ra-scroll border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="text-slate-500 dark:text-slate-400">Select a candidate to see details.</div>
      </div>
    );
  }

  return (
    <div className="relative grid h-[85vh] grid-rows-[auto,1fr] w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* ===== Non-scrolling PROFILE header (short) ===== */}
      <header className="px-4 pt-6 pb-4">
        <div className="mx-auto w-full max-w-6xl">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
            <SectionTitle>Profile</SectionTitle>
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {getName(selected)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {selected.role || "Candidate"}
                  </div>
                </div>

                {/* RIGHT SIDE: Created + Interview Room button */}
                <div className="ml-auto flex items-center gap-3">
                  {selected.created_at && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Created: {new Date(selected.created_at).toLocaleString()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPreflight(true)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Interview Room
                  </button>
                </div>
              </div>

              {/* contact/status row (kept in header for quick glance) */}
              <div className="mt-3">
                <RowItem label="Email" value={selected.email} />
                <RowItem label="Phone" value={selected.phone} />
                <RowItem label="Status" value={selected.status} />
                {selected.meta?.total_experience_years != null && (
                  <RowItem label="Total Exp." value={`${selected.meta.total_experience_years} yrs`} />
                )}
              </div>
            </div>
          </section>
        </div>
      </header>

      {/* ===== Scrollable content area with TWO columns ===== */}
      <main className="overflow-y-auto px-4 pb-4 ra-scroll">
        <div className="mx-auto w-full max-w-6xl grid gap-4 lg:grid-cols-2">
          {/* LEFT COLUMN — JD + RESUME */}
          <div className="space-y-4">
            {!!selected?.jd_raw && (
              <Panel>
                <div className="text-sm font-semibold mb-2">Job Description</div>
                <pre className="whitespace-pre-wrap text-sm leading-6">{selected.jd_raw}</pre>
              </Panel>
            )}
            {!!selected?.resume_raw && (
              <Panel>
                <div className="text-sm font-semibold mb-2">Candidate Resume</div>
                <pre className="whitespace-pre-wrap text-sm leading-6">{selected.resume_raw}</pre>
              </Panel>
            )}
          </div>

          {/* RIGHT COLUMN — REST OF THE DETAILS */}
          <div className="space-y-4">
            <Panel>
              <SectionTitle>SCORES</SectionTitle>
              <ScoreChips c={selected} />
            </Panel>

            <Panel>
              <SectionTitle>AI SUMMARY</SectionTitle>
              <RenderAISummary text={selected?.ai_summary} />
            </Panel>

            {selected.skills &&
              (selected.skills.languages?.length ||
                selected.skills.frameworks?.length ||
                selected.skills.tools?.length ||
                selected.skills.databases?.length ||
                selected.skills.soft_skills?.length) && (
                <Panel>
                  <SectionTitle>Skills</SectionTitle>

                  {selected.skills.languages?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-800 dark:text-slate-100">Languages: </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.languages.map((s, i) => (
                          <Chip key={`lang-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selected.skills.frameworks?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-800 dark:text-slate-100">Frameworks: </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.frameworks.map((s, i) => (
                          <Chip key={`fw-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selected.skills.tools?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-800 dark:text-slate-100">Tools: </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.tools.map((s, i) => (
                          <Chip key={`tool-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selected.skills.databases?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-800 dark:text-slate-100">Databases: </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.databases.map((s, i) => (
                          <Chip key={`db-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selected.skills.soft_skills?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-800 dark:text-slate-100">Soft Skills: </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.soft_skills.map((s, i) => (
                          <Chip key={`soft-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Panel>
              )}

            {Array.isArray(selected.experience) && selected.experience.length > 0 && (
              <Panel>
                <SectionTitle>Experience</SectionTitle>
                <div className="grid gap-3">
                  {selected.experience.map((e, idx) => (
                    <div
                      key={idx}
                      className="border-b border-dashed border-slate-200 pb-3 last:border-b-0 dark:border-slate-700"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {e.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {e.company} • {e.start_date} – {e.end_date}
                      </div>
                      {e.description && (
                        <p className="mt-1 text-sm leading-6 text-slate-800 dark:text-slate-100">
                          {e.description}
                        </p>
                      )}
                      {e.technologies?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {e.technologies.map((t, i) => (
                            <Chip key={`exp-${idx}-${i}`}>{t}</Chip>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {Array.isArray(selected.projects) && selected.projects.length > 0 && (
              <Panel>
                <SectionTitle>Projects</SectionTitle>
                <div className="grid gap-3">
                  {selected.projects.map((p, idx) => (
                    <div
                      key={idx}
                      className="border-b border-dashed border-slate-200 pb-3 last:border-b-0 dark:border-slate-700"
                    >
                      <div className="flex items-baseline gap-2">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {p.name}
                        </div>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline dark:text-blue-300"
                          >
                            (link)
                          </a>
                        )}
                      </div>
                      {p.impact && (
                        <div className="text-xs text-blue-600 dark:text-blue-300">{p.impact}</div>
                      )}
                      {p.description && (
                        <p className="mt-1 text-sm leading-6 text-slate-800 dark:text-slate-100">
                          {p.description}
                        </p>
                      )}
                      {p.technologies?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.technologies.map((t, i) => (
                            <Chip key={`proj-${idx}-${i}`}>{t}</Chip>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {Array.isArray(selected.education) && selected.education.length > 0 && (
              <Panel>
                <SectionTitle>Education</SectionTitle>
                <div className="grid gap-2">
                  {selected.education.map((e, idx) => (
                    <div key={idx}>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{e.degree}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {e.institution} • {e.start_year} – {e.end_year}
                      </div>
                      {e.score && (
                        <div className="text-sm text-slate-800 dark:text-slate-100">Score: {e.score}</div>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </main>

      <PreflightModal
        open={showPreflight}
        defaultMeet={selected?.meetLink || selected?.meta?.meet_url || ""}
        interviewerName={interviewerName}
        candidateName={getName(selected)}
        jdText={selected?.jd_raw || ""}
        resumeText={selected?.resume_raw || ""}
        onClose={() => setShowPreflight(false)}
      />
    </div>
  );
}
