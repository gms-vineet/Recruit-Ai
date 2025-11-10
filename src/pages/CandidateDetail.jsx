// pages/CandidateDetail.jsx
import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { getCandidateById } from "../utils/dummyCandidates";
import { fmtDate, fmtTime } from "../utils/dt";
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiTimeLine,
  RiBriefcase2Line,
  RiUser3Line,
  RiVideoChatLine,
  RiExternalLinkLine,
  RiFileTextLine,
  RiMapPinLine,
} from "@remixicon/react";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function CandidateDetail() {
  const { id } = useParams();
  const { state } = useLocation(); // may contain { candidate }
  const cand = state?.candidate || getCandidateById(id);

  if (!cand) return <div className="p-6">Candidate not found.</div>;

  const {
    candidate,
    role,
    start,
    end,
    status,
    notes,
    experience,
    skills = [],
    mode = "Video",
    meetLink,
    location,
    resumeUrl,
  } = cand;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Header: avatar + name + contacts */}
      <div className="mt-4 flex items-start gap-4">
        <div className="h-14 w-14 rounded-full grid place-items-center text-white shadow
                        bg-gradient-to-br from-indigo-500 to-violet-600">
          <span className="font-semibold">{initials(candidate?.name)}</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-tight">{candidate?.name}</h1>
          <div className="mt-1 text-slate-500 text-sm">
            {candidate?.email} • {candidate?.phone}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="mt-6 rounded-xl border border-slate-200/40 dark:border-slate-800
                      bg-white/70 dark:bg-slate-900/60 p-5 shadow">
        {/* Role */}
        <div className="flex items-center gap-2 text-lg">
          <RiBriefcase2Line className="h-5 w-5 text-slate-400" />
          <span className="font-semibold">{role}</span>
          {experience && (
            <span className="ml-2 text-sm text-slate-500">• {experience} experience</span>
          )}
          {status && (
            <span className="ml-auto px-2.5 py-1 text-[11px] rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {status}
            </span>
          )}
        </div>

        {/* When & Where */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-2">
            <RiCalendarLine className="h-4 w-4" /> {fmtDate(start)}
          </span>
          <span className="inline-flex items-center gap-2">
            <RiTimeLine className="h-4 w-4" /> {fmtTime(start)} – {fmtTime(end)}
          </span>

          {mode === "Video" ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-indigo-500 hover:underline"
            >
              <RiVideoChatLine className="h-4 w-4" />
              Join meeting
              <RiExternalLinkLine className="h-3 w-3" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-2">
              <RiMapPinLine className="h-4 w-4" /> {location || "Onsite"}
            </span>
          )}
        </div>

        {/* Optional: skills */}
        {!!skills.length && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800
                           text-slate-600 dark:text-slate-300"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mt-4 text-sm">
            <span className="font-medium">Notes:</span> {notes}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg
                         border border-slate-300/60 dark:border-slate-700
                         hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RiFileTextLine className="h-4 w-4" />
              View Resume
            </a>
          )}

          <button
            onClick={() => console.log("Start interview:", id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-gradient-to-b from-indigo-400 via-indigo-600 to-indigo-700
                       text-white text-sm font-semibold shadow hover:shadow-md"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}
