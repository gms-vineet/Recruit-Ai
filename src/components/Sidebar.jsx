// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  RiHome4Line,
  RiLogoutCircleRLine,
  RiCloseLine,
} from "@remixicon/react";
import SmallJobCard from "./SmallJobCard";
import { useDispatch, useSelector } from "react-redux";
import { getJobListRequest } from "./../store/slices/jobDataSlice";
import SmallJobCardLoader from "./Loaders/SmallJobCardLoader";
import CreateNewJobBtn from "./buttons/sidebar/CreateNewJobBtn";
import {
  setCreateNewJob,
  setShowTypeWriter,
  setModalOpen,
} from "./../store/slices/UI Slice/CreateJDSlice";
import { setActiveKey } from "./../store/slices/UI Slice/panelSlice";
import { resetJobState } from "./../store/slices/createJobSlice";
import { resetUploadJD } from "./../store/slices/uploadJdSlice";
import { fmtDate, fmtTime } from "../utils/dt";
import { fetchInterviewerInterviewsRequest } from "../store/slices/interviewerInterviewsSlice";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: RiHome4Line },
];

export default function Sidebar({ isCollapsed, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
const getStatusBadgeClass = (status) => {
  const s = (status || "").toUpperCase();

  switch (s) {
    case "INTERVIEW_SCHEDULED":
      // Green
      return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40";
    case "INTERVIEW_DONE":
      // Greyed out
      return "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/40";
    case "ABSENT":
      // Red
      return "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/40";
    default:
      return "bg-slate-600/15 text-slate-300 ring-1 ring-slate-600/40";
  }
};

const getStatusLabel = (status) =>
  (status || "").toUpperCase().replace(/_/g, " ");
  // JOBS
  const { loading: jobsLoading, jobListData } = useSelector(
    (state) => state.jobList
  );

  // INTERVIEWS (candidate list)
  const {
    loading: interviewsLoading,
    interviews,
  } = useSelector((s) => s.interviewerInterviews || {});

  const [selectedJobId, setSelectedJobId] = useState(null);

  const currentCandidateId = location.pathname.startsWith("/interview/")
    ? location.pathname.split("/").pop()
    : null;

  // ===== EFFECTS =====
  useEffect(() => {
    // jobs
    dispatch(getJobListRequest());

    // all scheduled interviews for logged-in interviewer
    dispatch(
      fetchInterviewerInterviewsRequest({
        status: "", // optional filter
      })
    );
  }, [dispatch]);

  // hydrate selected job from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("jobID");
    if (stored) setSelectedJobId(String(stored));
  }, []);

  // keep selected job consistent with loaded list
  useEffect(() => {
    if (!jobListData?.jobs?.length) return;

    if (selectedJobId) {
      const exists = jobListData.jobs.some(
        (j) => String(j.job_id) === String(selectedJobId)
      );
      if (!exists) {
        const fallback = String(jobListData.jobs[0].job_id);
        setSelectedJobId(fallback);
        localStorage.setItem("jobID", fallback);
      }
    } else {
      const stored = localStorage.getItem("jobID");
      const pick = stored
        ? String(stored)
        : String(jobListData.jobs[0].job_id);
      setSelectedJobId(pick);
      localStorage.setItem("jobID", pick);
    }
  }, [jobListData, selectedJobId]);

  // ===== CANDIDATES FROM API =====
  const getName = (c) =>
    c?.full_name ||
    c?.candidate?.name ||
    [c?.first_name, c?.last_name].filter(Boolean).join(" ") ||
    c?.email ||
    "—";

  // Your /interviewer/interviews response is FLAT:
  //  { interview_id, job_role, candidate_name, candidate_email, start_at, ... }
  const candidatesToday = useMemo(() => {
    if (!Array.isArray(interviews)) return [];
    return interviews
      .map((item) => ({
        id: item.interview_id,
        full_name: item.candidate_name,
        email: item.candidate_email,
        role: item.job_role,
        start: item.start_at,
         status: item.status,       
      }))
      .filter((c) => !!c.id);
  }, [interviews]);

  const handleCandidateCardClick = (cand) => {
    navigate(`/interview/${cand.id}`, { state: { candidate: cand } });
    onCloseMobile?.();
  };

  // ===== JOB CARD CLICK =====
  const handleJobCardClick = (jobId, jd_text) => {
    const idStr = String(jobId);
    setSelectedJobId(idStr);
    localStorage.setItem("jobID", idStr);

    onCloseMobile?.();
    dispatch(setCreateNewJob(false));
    dispatch(setActiveKey("jd"));

    navigate("/dashboard", {
      state: { jobIdSidebar: idStr, jDSidebar: jd_text },
    });
  };

  const handleCreateNewJobBtn = () => {
    dispatch(setCreateNewJob(true));
    dispatch(setShowTypeWriter(false));
    dispatch(resetUploadJD());
    dispatch(setModalOpen(false));
    navigate("/dashboard");
    dispatch(setActiveKey("jd"));
    dispatch(resetJobState());
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const chrome =
    "backdrop-blur-[16px] backdrop-saturate-[180%] bg-[rgba(30,41,59,0.15)] rounded-md border border-[rgba(100,116,139,0.2)] shadow-[0px_12px_40px_0_rgba(2,6,23,0.3),inset_0_0_120px_rgba(79,70,229,0.08),inset_0px_0px_4px_2px_rgba(255,255,255,0.1)]";

  /* ===================== Desktop (md+) ===================== */
  const Desktop = (
   <aside
    className={`hidden md:flex md:sticky md:top-0 md:self-start md:flex-shrink-0
                h-screen transition-all duration-300 ease-in-out flex-col m-2
                ${chrome}
                ${isCollapsed ? "md:w-24" : "md:w-72"}`}   // ⬅️ changed
    style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
    aria-label="Sidebar"
  >
      {/* Logo */}
      <div className="flex items-center justify-start px-3 h-16 shrink-0">
        <span
          className={`font-bold text-lg text-logotextcolor ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          Recruit.Ai <span className="text-slate-200 "> Interviewer</span>
        </span>
        <span
          className={`font-bold text-lg text-logotextcolor ${
            isCollapsed ? "block" : "hidden"
          }`}
        >
          R.ai
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center p-3 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 group
                 ${isCollapsed ? "justify-center" : "px-4"}
                 ${
                   isActive ? "bg-slate-200 dark:bg-slate-700" : ""
                 } last:border-b-2 last:border-slate-400 dark:last:border-slate-600`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
              <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {!isCollapsed && (
          <>
            {/* Candidate list header */}
            <div
              className={`flex items-center text-sm font-medium rounded-lg group ${
                isCollapsed ? "justify-center" : "px-3"
              }`}
            >
              <span
                className={`text-sm font-normal ${
                  isCollapsed ? "hidden" : "block"
                }`}
              >
                Candidate List
              </span>
            </div>

            {/* Candidate cards (from API) */}
            <div className="space-y-2 px-2">
              {interviewsLoading && (
                <div className="text-xs text-slate-400">Loading interviews…</div>
              )}

              {!interviewsLoading && candidatesToday.length === 0 && (
                <div className="text-xs text-slate-400">
                  No interviews assigned.
                </div>
              )}

              {candidatesToday.map((c) => (
                <button
    key={c.id}
    onClick={() => handleCandidateCardClick(c)}
    className={`w-full text-left rounded-lg border border-slate-200/30 dark:border-slate-700/50 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
      String(currentCandidateId) === String(c.id)
        ? "bg-slate-200/60 dark:bg-slate-700/60 ring-1 ring-slate-300 dark:ring-slate-600"
        : ""
    }`}
  >
    {/* Top row: Name + Status badge on right */}
    <div className="flex items-center justify-between gap-2">
      <div className="text-sm font-semibold truncate">
        {getName(c)}
      </div>

      {c.status && (
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(
            c.status
          )}`}
        >
          {getStatusLabel(c.status)}
        </span>
      )}
    </div>

    {/* Role */}
    <div className="mt-0.5 text-xs text-slate-500 truncate">
      {c.role}
    </div>

    {/* Date & time */}
    {c.start && (
      <div className="mt-1 text-[10px] text-slate-500">
        {fmtDate(c.start)} • {fmtTime(c.start)}
      </div>
    )}
  </button>
              ))}
            </div>

            {/* Jobs section */}
            {jobsLoading && (
              <div>
                <SmallJobCardLoader />
                <SmallJobCardLoader />
              </div>
            )}

            {!jobsLoading && jobListData && (
              <>
                {jobListData?.jobs?.map((job) => (
                  <SmallJobCard
                    key={job.job_id}
                    title={job.role}
                    min_experince={job.min_years}
                    max_experince={job.max_years}
                    jobType={job.employment_type}
                    jd_text={job.jd_text}
                    jobId={job.job_id}
                    active={String(selectedJobId) === String(job.job_id)}
                    onClick={handleJobCardClick}
                  />
                ))}
              </>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          className={`flex items-center p-3 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 group ${
            isCollapsed ? "justify-center" : "px-4"
          }`}
          onClick={handleLogout}
        >
          <RiLogoutCircleRLine className="w-6 h-6 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
          <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );

  /* ===================== Mobile Drawer (<md) ===================== */
  /* ===================== Mobile Drawer (<md) ===================== */
  const MobileDrawer = (
    <div
      className={`md:hidden fixed inset-0 z-50 ${
        mobileOpen ? "" : "pointer-events-none"
      }`}
      aria-hidden={!mobileOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onCloseMobile}
      />

      {/* Panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-4/5 max-w-[18rem] m-2
                    ${chrome}
                    transition-transform duration-300 ease-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-[120%]"}
                    flex flex-col`}
        style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Sidebar"
      >
        {/* Close */}
        <div className="flex items-center justify-between px-3 h-14">
          <span className="font-bold text-logotextcolor">Recruit.Ai</span>
          <button
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center p-3 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 group
                   ${isActive ? "bg-slate-200 dark:bg-slate-700" : ""}`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                <span className="ml-3">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="px-2 py-2">
            <div className="px-1 pb-2 text-sm text-slate-700 dark:text-slate-300">
              Job Roles
            </div>
            <CreateNewJobBtn clickFunc={() => onCloseMobile()} />

            {/* ✅ use jobsLoading here, not "loading" */}
            {jobsLoading && (
              <div>
                <SmallJobCardLoader />
                <SmallJobCardLoader />
              </div>
            )}

            {!jobsLoading && jobListData && (
              <>
                {jobListData?.jobs?.map((job) => (
                  <SmallJobCard
                    key={job.job_id}
                    title={job.role}
                    min_experince={job.min_years}
                    max_experince={job.max_years}
                    jobType={job.employment_type}
                    jd_text={job.jd_text}
                    jobId={job.job_id}
                    active={String(selectedJobId) === String(job.job_id)}
                    onClick={handleJobCardClick}
                  />
                ))}
              </>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => localStorage.clear()}
            className="flex items-center p-3 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 group"
          >
            <RiLogoutCircleRLine className="w-6 h-6 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      {Desktop}
      {MobileDrawer}
    </>
  );
}