import React, { useMemo, useState } from "react";

/**
 * Usage:
 * <ResumeViewer data={yourData} />
 * - `data` can be { rows: [...] } or an array of candidates.
 * - Dark/Light mode comes from your app's Tailwind setup (no local toggles).
 *
 *
 */

const RenderAISummary = ({ text }) => {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/);

  return (
    <div className="space-y-1 text-sm text-slate-800 dark:text-slate-100">
      {lines.map((line, i) => {
        const raw = line ?? "";
        const trimmed = raw.trim();

        if (!trimmed) return <div key={i} className="h-3" />;

        // ### Heading -> bold entire line (strip ###)
        if (/^#{3}\s*/.test(trimmed)) {
          const content = trimmed.replace(/^#{3}\s*/, "");
          return (
            <div key={i} className="font-bold">
              {content}
            </div>
          );
        }

        // - **Label** rest   OR   -**Label** rest  -> bullet + bold label + normal rest
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
        // If "-**" with no closing **, bold the remainder
        m = trimmed.match(/^\-\s*\*\*(.+)$/) || trimmed.match(/^\-\*\*(.+)$/);
        if (m) {
          return (
            <div key={i}>
              <span className="mr-2">•</span>
              <span className="font-bold">{m[1]}</span>
            </div>
          );
        }

        // **Leading bold** rest
        m = trimmed.match(/^\*\*(.+?)\*\*(.*)$/);
        if (m) {
          return (
            <div key={i}>
              <span className="font-bold">{m[1]}</span>
              <span>{m[2]}</span>
            </div>
          );
        }
        // If starts with ** but no closing, bold whole remainder
        if (/^\*\*/.test(trimmed)) {
          return (
            <div key={i} className="font-bold">
              {trimmed.replace(/^\*\*\s*/, "")}
            </div>
          );
        }

        // Default
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
  const [selectedIndex, setSelectedIndex] = useState(rows.length ? 0 : -1);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  const selected = selectedIndex >= 0 ? rows[selectedIndex] : null;

  const getName = (c) =>
    c?.full_name ||
    [c?.first_name, c?.last_name].filter(Boolean).join(" ") ||
    c?.email ||
    "Unknown";

  const SectionTitle = ({ children }) => (
    <h3 className="mt-3 mb-2 text-md font-semibold  tracking-wider text-slate-500 dark:text-slate-400">
      {String(children).toUpperCase()}
    </h3>
  );

  const Chip = ({ children }) => (
    <span className="text-sm font-semibold inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1  text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      {children}
    </span>
  );

  const RowItem = ({ label, value }) =>
    value ? (
      <div className="flex gap-3 py-1">
        <div className="w-28 text-xs text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-100">
          {value}
        </div>
      </div>
    ) : null;

  const ScoreChips = ({ c }) => {
    const list = [];
    const add = (label, val) => {
      if (typeof val === "number") list.push({ label, val });
    };
    add("Overall", c?.overall_score);
    add("Skill match", c?.skill_match_score ?? c?.meta?.skill_match_score);
    add(
      "Experience match",
      c?.experience_match_score ?? c?.meta?.experience_match_score
    );
    // add(
    //   "Education match",
    //   c?.education_match_score ?? c?.meta?.education_match_score
    // );
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

  const SidebarList = () => (
    <div className="mt-1" role="list" aria-label="Candidate list">
      {rows.map((c, i) => {
        const active = i === selectedIndex;
        return (
          <button
            key={c.candidate_id || c.email || i}
            onClick={() => {
              setSelectedIndex(i);
              setSidebarOpen(false);
            }}
            title={getName(c)}
            className={[
              "w-full cursor-pointer rounded-lg px-3 py-2 text-left transition",
              active
                ? "border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-900/30 dark:text-purple-200"
                : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800/60",
            ].join(" ")}
          >
            <div className="text-sm font-semibold leading-tight">
              {getName(c)}
            </div>
            <div
              className={
                active
                  ? "text-sm text-purple-600 dark:text-purple-300"
                  : "text-sm text-slate-500 dark:text-slate-400"
              }
            >
              {c.role || c.status || "—"}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex h-[85vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-4/5 max-w-sm border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:hidden transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex items-center justify-between px-1 pb-2">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">
            Candidates ({rows.length})
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            ✕
          </button>
        </div>
        <SidebarList />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="px-1 pb-2 text-sm font-semibold text-slate-700 dark:text-slate-100">
          Candidates ({rows.length})
        </div>
        <SidebarList />
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-white p-4 dark:bg-slate-950">
        {/* Top bar */}
        <div className="mb-2 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:hidden"
          >
            ☰
          </button>
          <div className="text-base font-bold text-slate-700 dark:text-slate-100">
            Candidate Data
          </div>
        </div>

        {!selected ? (
          <div className="text-slate-500 dark:text-slate-400">
            Select a candidate to see details.
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-5xl gap-4">
            {/* === SCORES  === */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <SectionTitle>SCORES </SectionTitle>
              <ScoreChips c={selected} />
            </section>

            {/* Header / Profile */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  {getName(selected).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-100">
                    {getName(selected)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {selected.role || "Candidate"}
                  </div>
                </div>
                {selected.created_at && (
                  <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                    Created: {new Date(selected.created_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="mt-3">
                <RowItem label="Email" value={selected.email} />
                <RowItem label="Phone" value={selected.phone} />
                <RowItem label="Location" value={selected.location} />
                <RowItem label="Status" value={selected.status} />
                {selected.meta?.total_experience_years != null && (
                  <RowItem
                    label="Total Exp."
                    value={`${selected.meta.total_experience_years} yrs`}
                  />
                )}
              </div>
            </section>

            {/* === AI SUMMARY (TOP) === */}

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <SectionTitle>AI SUMMARY</SectionTitle>
              <RenderAISummary text={selected?.ai_summary} />
            </section>

            {/* Skills */}
            {selected.skills &&
              (selected.skills.languages?.length ||
                selected.skills.frameworks?.length ||
                selected.skills.tools?.length ||
                selected.skills.databases?.length ||
                selected.skills.soft_skills?.length) && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <SectionTitle>Skills</SectionTitle>
                  {selected.skills.languages?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-700 dark:text-slate-100">
                        Languages:{" "}
                      </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.languages.map((s, i) => (
                          <Chip key={`lang-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {selected.skills.frameworks?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-700 dark:text-slate-100">
                        Frameworks:{" "}
                      </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.frameworks.map((s, i) => (
                          <Chip key={`fw-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {selected.skills.tools?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-700 dark:text-slate-100">
                        Tools:{" "}
                      </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.tools.map((s, i) => (
                          <Chip key={`tool-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {selected.skills.databases?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-700 dark:text-slate-100">
                        Databases:{" "}
                      </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.databases.map((s, i) => (
                          <Chip key={`db-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {selected.skills.soft_skills?.length ? (
                    <div className="mb-2 text-sm">
                      <strong className="text-slate-700 dark:text-slate-100">
                        Soft Skills:{" "}
                      </strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selected.skills.soft_skills.map((s, i) => (
                          <Chip key={`soft-${i}`}>{s}</Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              )}

            {/* Experience */}
            {Array.isArray(selected.experience) &&
              selected.experience.length > 0 && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <SectionTitle>Experience</SectionTitle>
                  <div className="grid gap-3">
                    {selected.experience.map((e, idx) => (
                      <div
                        key={idx}
                        className="border-b border-dashed border-slate-200 pb-3 last:border-b-0 dark:border-slate-700"
                      >
                        <div className="font-semibold text-slate-700 dark:text-slate-100">
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
                </section>
              )}

            {/* Projects */}
            {Array.isArray(selected.projects) &&
              selected.projects.length > 0 && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <SectionTitle>Projects</SectionTitle>
                  <div className="grid gap-3">
                    {selected.projects.map((p, idx) => (
                      <div
                        key={idx}
                        className="border-b border-dashed border-slate-200 pb-3 last:border-b-0 dark:border-slate-700"
                      >
                        <div className="flex items-baseline gap-2">
                          <div className="font-semibold text-slate-700 dark:text-slate-100">
                            {p.name}
                          </div>
                          {p.link ? (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline dark:text-blue-300"
                            >
                              (link)
                            </a>
                          ) : null}
                        </div>
                        {p.impact && (
                          <div className="text-xs text-blue-600 dark:text-blue-300">
                            {p.impact}
                          </div>
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
                </section>
              )}

            {/* Education */}
            {Array.isArray(selected.education) &&
              selected.education.length > 0 && (
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <SectionTitle>Education</SectionTitle>
                  <div className="grid gap-2">
                    {selected.education.map((e, idx) => (
                      <div key={idx}>
                        <div className="font-semibold text-slate-700 dark:text-slate-100">
                          {e.degree}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {e.institution} • {e.start_year} – {e.end_year}
                        </div>
                        {e.score ? (
                          <div className="text-sm text-slate-800 dark:text-slate-100">
                            Score: {e.score}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        )}
      </main>
    </div>
  );
}
