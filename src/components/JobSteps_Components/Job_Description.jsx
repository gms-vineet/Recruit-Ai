// src/components/Job_Description.jsx
import React, { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import AiLoader from "./../Loaders/AiLoader";
import NewJobForm from "./../forms/NewJobForm";
import TypewriterForm from "./../forms/TypewriterForm";
import JDUploadForm from "./../forms/JDUploadForm";

import { fmtDate, fmtTime } from "../../utils/dt";
import {
  setCreateNewJD,
  setUploadJD,
  setModalOpen,
} from "./../../store/slices/UI Slice/CreateJDSlice";

import { fetchTodayInterviewsRequest } from "./../../store/slices/todayInterviewsSlice";
import { RiCalendarLine } from "@remixicon/react";

// helper: unified display name
const getName = (c) =>
  c?.full_name ||
  c?.candidate?.name ||
  [c?.first_name, c?.last_name].filter(Boolean).join(" ") ||
  c?.email ||
  "—";

// map API interview → UI card object
const mapInterviewToCard = (iv) => ({
  id: iv.interview_id,
  full_name: iv.candidate_name,
  email: iv.candidate_email,
  role: iv.job_title,
  start: iv.start_at,
  end: iv.end_at,
  status: iv.status || "INTERVIEW_SCHEDULED",
  meet_link: iv.meet_link,
  calendar_link: iv.calendar_link, // 👈 already added
});

/** ---------- Small modal to display Google Calendar event ---------- */
const CalendarModal = ({ open, url, onClose }) => {
  if (!open || !url) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[95vw] max-w-4xl h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="text-sm font-semibold">Interview event in calendar</div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Close
            </button>
          </div>
        </div>

        {/* iframe */}
        <iframe
          src={url}
          title="Google Calendar Event"
          className="w-full h-[calc(100%-44px)] border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default function Job_Description() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // interviewer name from auth slice
  const me = useSelector((s) => s?.auth?.me);
  const interviewerName = me?.interviewer?.name ?? "-";

  // company & JD states
  const companyState = useSelector((s) => s?.company) || { loading: false };
  const companyLoading = companyState.loading;

  const {
    createNewJD = false,
    isModalOpen = false,
    uploadJD = false,
    showTypeWriter = false,
  } = useSelector((s) => s?.createJD) || {};

  const {
    isJobCreated = false,
    regenerating = false,
    loading = false,
  } = useSelector((s) => s?.createJob) || {};

  const { data = null, quesLoading = false } =
    useSelector((s) => s?.uploadJD) || {};

  // today's interviews slice
  const {
    interviews: apiInterviews = [],
    loading: todayLoading,
    error: todayError,
    date: todayDate,
    count: todayCount,
  } = useSelector((s) => s?.todayInterviews || {});

  // 🔹 state for calendar modal
  const [calendarUrl, setCalendarUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // fetch today interviews on mount
  useEffect(() => {
    dispatch(setCreateNewJD(true)); // your existing behaviour
    dispatch(fetchTodayInterviewsRequest());
  }, [dispatch]);

  const { jDSidebar } = location.state || {};
  const jobIdSidebar = localStorage.getItem("jobID");

  const handleCloseModal = () => dispatch(setModalOpen(false));

  const isBusy = loading || regenerating || quesLoading || companyLoading;

  // map API objects to card objects for UI
  const todaysInterviews = apiInterviews.map(mapInterviewToCard);

  const openInterview = (interview) => {
    navigate(`/interview/${interview.id}`);
  };

  const Card = (it) => (
    <div
      key={it.id}
      onClick={() => openInterview(it)}
      className="rounded-xl border border-slate-200/20 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
      role="button"
      aria-label={`Open ${getName(it)}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold truncate">{getName(it)}</div>
        <span className="px-2.5 py-1 text-[10px] rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {it.status}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-medium">{it.role}</span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
        <span>{fmtDate(it.start)}</span>
      </div>

      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
        <span>
          {fmtTime(it.start)} – {fmtTime(it.end)}
        </span>
      </div>

      {/* 🔹 View in calendar (stops card click) */}
    {it.calendar_link && (
  <a
    href={it.calendar_link}
    target="_blank"
    rel="noreferrer"
    onClick={(e) => e.stopPropagation()} // keep card click from firing
    className="mt-2 inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-400"
  >
    <RiCalendarLine className="h-3 w-3" />
    <span>View in Calendar</span>
  </a>
)}
    </div>
  );

  return (
    <div className="h-full w-full grid place-items-center">
      {isBusy ? (
        <div className="h-full flex items-center justify-center opacity-30">
          <AiLoader />
        </div>
      ) : (
        <section className="w-full max-w-5xl px-4 py-10">
          {!isModalOpen &&
            !isJobCreated &&
            !data &&
            !jDSidebar &&
            !showTypeWriter && (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-l from-purple-300 via-purple-600 to-red-950 dark:from-slate-800 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                  <Typewriter
                    options={{
                      strings: [
                        `Hi there, ${
                          interviewerName !== "-" ? interviewerName : "TestUser"
                        }`,
                      ],
                      autoStart: true,
                      loop: false,
                      delay: 50,
                      deleteSpeed: Infinity,
                      pauseFor: 2000,
                    }}
                  />
                  <span className="block mt-1 text-2xl font-semibold text-gray-500">
                    Today&apos;s Interview is Scheduled
                  </span>
                </h1>

                {/* status for today's interviews */}
                {todayLoading && (
                  <p className="mt-4 text-sm text-slate-400">
                    Loading today&apos;s interviews…
                  </p>
                )}
                {todayError && (
                  <p className="mt-4 text-sm text-red-400">{todayError}</p>
                )}
                {!todayLoading &&
                  !todayError &&
                  todaysInterviews.length === 0 && (
                    <p className="mt-4 text-sm text-slate-400">
                      No interviews scheduled for today.
                    </p>
                  )}

                {/* Compact two-column grid */}
                {!todayLoading && todaysInterviews.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {todaysInterviews.map((it) => (
                      <Card key={it.id} {...it} />
                    ))}
                  </div>
                )}
              </>
            )}

          {isModalOpen && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative w-[92vw] max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {createNewJD ? "Create New Job" : "Upload Job Description"}
                    </h3>
                    <button
                      onClick={handleCloseModal}
                      className="inline-flex h-8 px-3 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {createNewJD && <NewJobForm />}
                  {!data && uploadJD && <JDUploadForm />}
                  {data && (
                    <NewJobForm
                      data={data}
                      job={data?.job || data?.parsed}
                      questions={data?.questions || []}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {(isJobCreated || jDSidebar || showTypeWriter) && (
            <TypewriterForm
              JDfromSidebar={jDSidebar}
              jobIDSidebar={jobIdSidebar}
            />
          )}
        </section>
      )}

      {/* 🔹 Calendar modal at root */}
      <CalendarModal
        open={showCalendar}
        url={calendarUrl}
        onClose={() => setShowCalendar(false)}
      />
    </div>
  );
}
