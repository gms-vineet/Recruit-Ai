import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  RiEyeLine,
  RiCloseLine,
  RiUserStarLine,
  RiStackLine,
  RiUserLine,
  RiTrophyLine,
  RiCursorLine,
} from "@remixicon/react";

/**
 * ResumeTable (Tailwind + react-data-table-component + @remixicon/react)
 *
 * - Columns: Candidate, Skills, Scores, Actions
 * - Row selection with “Shortlist Candidate” button when any selected
 * - “View Details” opens a right drawer showing full details (same style as ResumeViewer)
 * - Styles adapt to your app's dark/light mode automatically (reads Tailwind's `dark` class or system media)
 *
 * Usage:
 * <ResumeTable data={yourData} onShortlist={(rows) => console.log(rows)} />
 */
export default function ResumeTable({ data, onShortlist }) {
  const rawRows = useMemo(
    () => (Array.isArray(data) ? data : data?.rows || []),
    [data]
  );

  // Ensure stable key for selection even if candidate_id is missing
  const rows = useMemo(
    () =>
      rawRows.map((r, i) => ({
        _rid: r.candidate_id || r.resume_id || r.email || String(i),
        ...r,
      })),
    [rawRows]
  );

  const [selectedRows, setSelectedRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  const getName = (c) =>
    c?.full_name ||
    [c?.first_name, c?.last_name].filter(Boolean).join(" ") ||
    c?.email ||
    "Unknown";

  const Chip = ({ children }) => (
    <span className="inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      {children}
    </span>
  );

  const SectionTitle = ({ children }) => (
    <h3 className="mt-3 mb-2 text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300">
      {String(children).toUpperCase()}
    </h3>
  );

  const RowItem = ({ label, value }) =>
    value ? (
      <div className="flex gap-3 py-1">
        <div className="w-28 text-xs text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="text-sm text-slate-900 dark:text-slate-100">
          {value}
        </div>
      </div>
    ) : null;

  const ScoreChips = ({ c }) => {
    const list = [];
    const add = (label, val) => {
      if (typeof val === "number") list.push({ label, val });
    };
    // add("Overall", c?.overall_score);
    add("Skill match", c?.skill_match_score ?? c?.meta?.skill_match_score);
    add(
      "Experience match",
      c?.experience_match_score ?? c?.meta?.experience_match_score
    );
    // add("Education match", c?.education_match_score ?? c?.meta?.education_match_score);
    // add("JD match", c?.jd_match_score ?? c?.meta?.jd_match_score);
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

  const SkillsChips = ({ c, max = 10 }) => {
    const s = c?.skills || {};
    const pool = [
      ...(s.languages || []),
      ...(s.frameworks || []),
      ...(s.tools || []),
      ...(s.databases || []),
    ].filter(Boolean);
    if (!pool.length)
      return (
        <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
      );

    const shown = pool.slice(0, max);
    const more = pool.length - shown.length;

    return (
      <div className="flex flex-wrap items-center gap-2 my-4">
        {shown.map((t, i) => (
          <Chip key={`${t}-${i}`}>{t}</Chip>
        ))}
        {more > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            +{more} more
          </span>
        )}
      </div>
    );
  };

  // AI summary formatter (###, **..., and -**... patterns in bold)
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
            const content = trimmed.replace(/^#{3}\s*/, "");
            return (
              <div key={i} className="font-bold">
                {content}
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

  // Detect Tailwind dark mode to style react-data-table-component
  const isDark = useTailwindDarkMode();

  const columns = useMemo(
    () => [
      {
        name: (
          <div className="inline-flex items-center gap-2">
            {/* <RiUserLine className="h-4 w-4" /> */}
            <span>Candidate</span>
          </div>
        ),
        selector: (row) => getName(row),
        sortable: true,
        grow: 1.1,
        cell: (row) => (
          <div className="py-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {getName(row)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {row.role || row.status || "—"}
            </div>
          </div>
        ),
      },
      {
        name: (
          <div className="inline-flex items-center gap-2">
            <RiStackLine className="h-4 w-4" />
            <span>Skills</span>
          </div>
        ),
        sortable: false,
        grow: 1.4,
        cell: (row) => <SkillsChips c={row} />,
      },
      {
        name: (
          <div className="inline-flex items-center gap-2">
            {/* <RiTrophyLine className="h-4 w-4" /> */}
            <span>Scores</span>
          </div>
        ),
        sortable: false,
        grow: 1.8,
        cell: (row) => <ScoreChips c={row} />,
      },
      {
        name: (
          <div className="inline-flex items-center gap-2">
            {/* <RiCursorLine className="h-4 w-4" /> */}
            <span>Actions</span>
          </div>
        ),
        button: true,
        width: "140px",
        cell: (row) => (
          <button
            type="button"
            onClick={() => {
              setDrawerData(row);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <RiEyeLine className="h-4 w-4" />
            View Details
          </button>
        ),
      },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      table: {
        style: {
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
        },
      },
      headRow: {
        style: {
          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
          color: isDark ? "#e5e7eb" : "#0f172a",
          borderBottomColor: isDark ? "#1f2937" : "#e2e8f0",
          minHeight: "48px",
        },
      },
      headCells: {
        style: {
          fontWeight: 600,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        },
      },
      rows: {
        style: {
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          color: isDark ? "#e5e7eb" : "#0f172a",
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
          minHeight: "54px",
        },
        highlightOnHoverStyle: {
          backgroundColor: isDark
            ? "rgba(59,130,246,0.12)"
            : "rgba(59,130,246,0.08)", // blue-500 tint
          color: isDark ? "#e5e7eb" : "#0f172a",
          transitionDuration: "200ms",
          transitionProperty: "background-color,color",
          cursor: "pointer",
        },
      },
      cells: {
        style: {
          color: isDark ? "#e5e7eb" : "#0f172a",
        },
      },
      pagination: {
        style: {
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          color: isDark ? "#e5e7eb" : "#0f172a",
          borderTopColor: isDark ? "#1f2937" : "#e5e7eb",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: isDark
          ? "rgba(59,130,246,0.10)"
          : "rgba(59,130,246,0.08)",
        transitionDuration: "0.25s",
        transitionProperty: "background-color",
        outline: "none",
      },
    }),
    [isDark]
  );

  const onSelectedChange = ({ selectedRows }) => setSelectedRows(selectedRows);

  return (
    <div className="relative w-full">
      {/* Top bar with shortlist when selection exists */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Resumes ({rows.length})
        </div>
        {selectedRows.length > 0 && (
          <button
            type="button"
            onClick={() => onShortlist && onShortlist(selectedRows)}
            className="inline-flex items-center gap-2 rounded-md border border-purple-300 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 dark:border-purple-900/40"
          >
            <RiUserStarLine className="h-4 w-4" />
            Select for Interview ({selectedRows.length})
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <DataTable
          columns={columns}
          data={rows}
          keyField="_rid"
          selectableRows
          onSelectedRowsChange={onSelectedChange}
          highlightOnHover
          pagination
          dense
          customStyles={customStyles}
          noDataComponent={
            <div className="py-8 w-full flex justify-center items-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              No candidates to display
            </div>
          }
        />
      </div>

      {/* Right Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2">
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                Candidate Details
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="ml-auto inline-grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                aria-label="Close"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            {!drawerData ? (
              <div className="text-slate-500 dark:text-slate-400">
                No candidate selected.
              </div>
            ) : (
              <div className="mx-auto grid w-full max-w-3xl gap-4">
                {/* SCORES (TOP) */}
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <SectionTitle>Scores</SectionTitle>
                  <ScoreChips c={drawerData} />
                </section>

                {/* Header / Profile */}
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      {getName(drawerData).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {getName(drawerData)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {drawerData.role || "Candidate"}
                      </div>
                    </div>
                    {drawerData.created_at && (
                      <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        Created:{" "}
                        {new Date(drawerData.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <RowItem label="Email" value={drawerData.email} />
                    <RowItem label="Phone" value={drawerData.phone} />
                    <RowItem label="Location" value={drawerData.location} />
                    <RowItem label="Status" value={drawerData.status} />
                    {/* <RowItem label="Job ID" value={drawerData.job_id} />
                    <RowItem label="Resume ID" value={drawerData.resume_id} /> */}
                    {/* <RowItem
                      label="Candidate ID"
                      value={drawerData.candidate_id}
                    /> */}
                    {drawerData.meta?.total_experience_years != null && (
                      <RowItem
                        label="Total Exp."
                        value={`${drawerData.meta.total_experience_years} yrs`}
                      />
                    )}
                  </div>
                </section>

                {/* Skills */}
                {drawerData.skills &&
                  (drawerData.skills.languages?.length ||
                    drawerData.skills.frameworks?.length ||
                    drawerData.skills.tools?.length ||
                    drawerData.skills.databases?.length ||
                    drawerData.skills.soft_skills?.length) && (
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <SectionTitle>Skills</SectionTitle>
                      {drawerData.skills.languages?.length ? (
                        <div className="mb-2 text-sm">
                          <strong className="text-slate-900 dark:text-slate-100">
                            Languages:{" "}
                          </strong>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {drawerData.skills.languages.map((s, i) => (
                              <Chip key={`lang-${i}`}>{s}</Chip>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {drawerData.skills.frameworks?.length ? (
                        <div className="mb-2 text-sm">
                          <strong className="text-slate-900 dark:text-slate-100">
                            Frameworks:{" "}
                          </strong>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {drawerData.skills.frameworks.map((s, i) => (
                              <Chip key={`fw-${i}`}>{s}</Chip>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {drawerData.skills.tools?.length ? (
                        <div className="mb-2 text-sm">
                          <strong className="text-slate-900 dark:text-slate-100">
                            Tools:{" "}
                          </strong>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {drawerData.skills.tools.map((s, i) => (
                              <Chip key={`tool-${i}`}>{s}</Chip>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {drawerData.skills.databases?.length ? (
                        <div className="mb-2 text-sm">
                          <strong className="text-slate-900 dark:text-slate-100">
                            Databases:{" "}
                          </strong>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {drawerData.skills.databases.map((s, i) => (
                              <Chip key={`db-${i}`}>{s}</Chip>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {drawerData.skills.soft_skills?.length ? (
                        <div className="mb-2 text-sm">
                          <strong className="text-slate-900 dark:text-slate-100">
                            Soft Skills:{" "}
                          </strong>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {drawerData.skills.soft_skills.map((s, i) => (
                              <Chip key={`soft-${i}`}>{s}</Chip>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  )}

                {/* AI SUMMARY (BOTTOM) */}
                {drawerData.ai_summary && (
                  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <SectionTitle>AI Summary</SectionTitle>
                    <RenderAISummary text={drawerData.ai_summary} />
                  </section>
                )}

                {/* Experience */}
                {Array.isArray(drawerData.experience) &&
                  drawerData.experience.length > 0 && (
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <SectionTitle>Experience</SectionTitle>
                      <div className="grid gap-3">
                        {drawerData.experience.map((e, idx) => (
                          <div
                            key={idx}
                            className="border-b border-dashed border-slate-200 pb-3 last:border-b-0 dark:border-slate-700"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
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
                {Array.isArray(drawerData.projects) &&
                  drawerData.projects.length > 0 && (
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <SectionTitle>Projects</SectionTitle>
                      <div className="grid gap-3">
                        {drawerData.projects.map((p, idx) => (
                          <div
                            key={idx}
                            className="border-b border-dashed border-slate-200 pb-3 last:border-b-0 dark:border-slate-700"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {p.name}
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
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

/* ---- Hook: detect Tailwind dark mode (class or media) ---- */
function useTailwindDarkMode() {
  const getDark = () =>
    (typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")) ||
    (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [isDark, setIsDark] = useState(getDark);

  useEffect(() => {
    // Observe class changes (class strategy)
    const el = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(getDark()));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });

    // Listen to media changes (media strategy)
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setIsDark(getDark());
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      obs.disconnect();
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  return isDark;
}
