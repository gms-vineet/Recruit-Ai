// src/pages/Todaysinterview.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInterviewerInterviewsRequest } from "../store/slices/interviewerInterviewsSlice";
import { fmtDate, fmtTime } from "../utils/dt";

// --- helpers copied from Sidebar so badge styles stay consistent ---
const getStatusBadgeClass = (status) => {
  const s = (status || "").toUpperCase();

  switch (s) {
    case "INTERVIEW_SCHEDULED":
      return (
        "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/80 " +
        "dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/40"
      );
    case "INTERVIEW_DONE":
      return (
        "bg-slate-200 text-slate-700 ring-1 ring-slate-400/80 " +
        "dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/40"
      );
    case "ABSENT":
      return (
        "bg-rose-100 text-rose-700 ring-1 ring-rose-300/80 " +
        "dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/40"
      );
    default:
      return (
        "bg-slate-100 text-slate-700 ring-1 ring-slate-300/80 " +
        "dark:bg-slate-600/15 dark:text-slate-300 dark:ring-slate-600/40"
      );
  }
};

const getStatusLabel = (status) => {
  const upper = (status || "").toUpperCase();

  const withoutPrefix = upper.startsWith("INTERVIEW_")
    ? upper.replace(/^INTERVIEW_/, "")
    : upper;

  return withoutPrefix.replace(/_/g, " ");
};

// simple "today" check (you can later tune for timezone if needed)
const isSameDay = (dateStr, today = new Date()) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "";
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
};

export default function Todaysinterview() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading = false,
    error,
    interviews,
  } = useSelector((s) => s.interviewerInterviews || {});

  // fetch interviews (if not already loaded)
  useEffect(() => {
    dispatch(
      fetchInterviewerInterviewsRequest({
        status: "", // keep it generic; backend already filters per interviewer
      })
    );
  }, [dispatch]);

  const todayItems = useMemo(() => {
    if (!Array.isArray(interviews)) return [];
    const today = new Date();

    return interviews
      .filter((iv) => isSameDay(iv.start_at || iv.startAt, today))
      .map((iv) => ({
        id: iv.interview_id,
        interviewerName: iv.interviewer_name || iv.interviewer || "",
        candidateName: iv.candidate_name,
        email: iv.candidate_email,
        role: iv.job_role,
        start: iv.start_at || iv.startAt,
        status: iv.status,
        // 🔌 when you have meeting / calendar URLs from API, map them here:
        meetLink:
          iv.meet_url || iv.meet_link || iv.meeting_url || iv.meeting_link || "",
        calendarLink: iv.calendar_link || iv.calendar_url || "",
      }))
      .filter((x) => !!x.id)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [interviews]);

  const handleOpenInterview = (iv) => {
    // open your existing CandidateDetail / Preflight flow
    navigate(`/interview/${iv.id}`, { state: { candidate: iv } });
  };

  const handleJoinMeet = (iv) => {
    if (iv.meetLink) {
      window.open(iv.meetLink, "_blank", "noopener,noreferrer");
    } else {
      // fallback: go via interview detail
      handleOpenInterview(iv);
    }
  };

  const handleOpenCalendar = (iv) => {
    if (iv.calendarLink) {
      window.open(iv.calendarLink, "_blank", "noopener,noreferrer");
    } else {
      console.log("No calendar link present for interview", iv.id);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header – like your design */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
            Upcoming interviews
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Today&apos;s schedule
          </p>
        </header>

        {/* States: loading / error / empty / list */}
        {loading && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Loading today&apos;s interviews…
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-rose-500">
            Failed to load interviews. Please try again.
          </div>
        )}

        {!loading && !error && todayItems.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            You don&apos;t have any interviews scheduled for today.
          </div>
        )}

        {!loading && !error && todayItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {todayItems.map((iv) => (
              <div
                key={iv.id}
                className="group rounded-2xl border border-white/70 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.26)] dark:border-slate-700/70 dark:bg-slate-900/80"
              >
                {/* Top row: calendar pill + status */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[13px] text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                      📅
                    </span>
                    <span>
                      {fmtDate(iv.start)} • {fmtTime(iv.start)}
                    </span>
                  </div>

                  {iv.status && (
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(
                        iv.status
                      )}`}
                    >
                      {getStatusLabel(iv.status)}
                    </span>
                  )}
                </div>

                {/* Interviewer row with avatar */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {getInitials(iv.interviewerName || iv.candidateName || "")}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      Interviewer: {iv.interviewerName || "—"}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{iv.role || "Interview"}</span>
                      <span className="mx-1 text-slate-400">•</span>
                      <span>Interview</span>
                    </div>
                  </div>
                </div>

                {/* Candidate line */}
                <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Candidate: </span>
                  {iv.candidateName}
                </div>

                {/* Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleJoinMeet(iv)}
                    className="inline-flex items-center justify-center rounded-full bg-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/70"
                  >
                    Join meet
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCalendar(iv)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300/70 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Open in calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
