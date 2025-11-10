import React from "react";
import {
  RiUser3Line,
  RiBriefcase2Line,
  RiCalendarLine,
  RiTimeLine,
  RiVideoChatLine,
  RiMapPinLine,
  RiFileTextLine,
  RiExternalLinkLine,
  RiArrowRightLine,
} from "@remixicon/react";

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export default function TodayInterviewCard({ data, onStart }) {
  const {
    id,
    candidate,
    role,
    experience,
    skills = [],
    mode,
    location,
    meetLink,
    start,
    end,
    resumeUrl,
    status,
  } = data || {};

  return (
    <div className="w-full rounded-2xl border border-slate-200/20 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-lg p-5 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow">
            <RiUser3Line className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">{candidate?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {candidate?.email} • {candidate?.phone}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {status || "Scheduled"}
        </span>
      </div>

      {/* Body */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <RiBriefcase2Line className="h-4 w-4 text-slate-400" />
            <span className="font-medium">{role}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Experience: {experience}</div>

          <div className="mt-2 flex flex-wrap gap-2">
            {skills.slice(0, 6).map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <RiCalendarLine className="h-4 w-4 text-slate-400" />
            <span>{fmtDate(start)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiTimeLine className="h-4 w-4 text-slate-400" />
            <span>
              {fmtTime(start)} – {fmtTime(end)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {mode === "Video" ? (
              <>
                <RiVideoChatLine className="h-4 w-4 text-slate-400" />
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 hover:underline inline-flex items-center gap-1"
                >
                  Join meeting <RiExternalLinkLine className="h-3 w-3" />
                </a>
              </>
            ) : (
              <>
                <RiMapPinLine className="h-4 w-4 text-slate-400" />
                <span>{location}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-end md:items-center justify-between md:justify-end gap-3">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-300/50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RiFileTextLine className="h-4 w-4" />
            View Resume
          </a>

          <button
            onClick={() => onStart?.(id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-b from-indigo-400 via-indigo-600 to-indigo-700 text-white font-semibold shadow hover:shadow-md"
          >
            Start Interview
            <RiArrowRightLine className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
