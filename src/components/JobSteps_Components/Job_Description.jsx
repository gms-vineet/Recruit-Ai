import React, { useEffect } from "react";
import Typewriter from "typewriter-effect";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AiLoader from "./../Loaders/AiLoader";
import NewJobForm from "./../forms/NewJobForm";
import TypewriterForm from "./../forms/TypewriterForm";
import JDUploadForm from "./../forms/JDUploadForm";
import { useNavigate } from "react-router-dom";
import { buildDummyCandidates } from "../../utils/dummyCandidates"; // adjust path
import { fmtDate, fmtTime } from "../../utils/dt";
import { setCreateNewJD, setUploadJD, setModalOpen } from "./../../store/slices/UI Slice/CreateJDSlice";
import {
  RiBriefcase2Line,
  RiCalendarLine,
  RiTimeLine,
} from "@remixicon/react";

// function fmtTime(iso) {
//   const d = new Date(iso);
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }
// function fmtDate(iso) {
//   const d = new Date(iso);
//   return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
// }

function buildDummyInterviews() {
  const now = new Date();
  const mk = (h, m, id, name, role) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    return { id, candidate: { name }, role, start: start.toISOString(), end: end.toISOString(), status: "Scheduled" };
  };
  return [
    mk(11, 0, "INT-001", "Aarav Mehta", "Android Automotive HMI Engineer"),
    mk(15, 30, "INT-002", "Sara Khan", "AAOS Platform Engineer"),
    mk(17, 0, "INT-003", "Rahul Verma", "Infotainment Middleware Engineer"),
  ];
}

export default function Job_Description() {
  const dispatch = useDispatch();

  const me = useSelector((s) => s?.auth?.me);
  const interviewerName = me?.interviewer?.name ?? "-";

  const companyState = useSelector((s) => s?.company) || { loading: false };
  const companyLoading = companyState.loading;

  const { createNewJD = false, isModalOpen = false, uploadJD = false, showTypeWriter = false } =
    useSelector((s) => s?.createJD) || {};
  const { isJobCreated = false, regenerating = false, loading = false } =
    useSelector((s) => s?.createJob) || {};
  const { data = null, quesLoading = false } = useSelector((s) => s?.uploadJD) || {};

  useEffect(() => {
    dispatch(setCreateNewJD(true));
  }, [dispatch]);

  const location = useLocation();
  const { jDSidebar } = location.state || {};
  const jobIdSidebar = localStorage.getItem("jobID");

  const handleCloseModal = () => dispatch(setModalOpen(false));
  const isBusy = loading || regenerating || quesLoading || companyLoading;

const navigate = useNavigate();
const todaysInterviews = buildDummyCandidates();

const openCandidate = (cand) => {
  navigate(`/candidate/${cand.id}`, { state: { candidate: cand } });
};

  const Card = (it) => (
  <div
    key={it.id}
    onClick={() => openCandidate(it)}
    className="rounded-xl border border-slate-200/20 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
    role="button"
    aria-label={`Open ${it.candidate.name}`}
  >
    <div className="flex items-center justify-between">
      <div className="font-semibold truncate">{it.candidate.name}</div>
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
      <span>{fmtTime(it.start)} – {fmtTime(it.end)}</span>
    </div>
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
          {!isModalOpen && !isJobCreated && !data && !jDSidebar && !showTypeWriter && (
            <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-l from-purple-300 via-purple-600 to-red-950 dark:from-slate-800 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                <Typewriter
                  options={{
                    strings: [`Hi there, ${interviewerName !== "-" ? interviewerName : "TestUser"}`],
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

              {/* Compact two-column grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {todaysInterviews.map((it) => (
                  <Card key={it.id} {...it} />
                ))}
              </div>
            </>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
              <div
                className="relative w-[92vw] max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{createNewJD ? "Create New Job" : "Upload Job Description"}</h3>
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
            <TypewriterForm JDfromSidebar={jDSidebar} jobIDSidebar={jobIdSidebar} />
          )}
        </section>
      )}
    </div>
  );
}
