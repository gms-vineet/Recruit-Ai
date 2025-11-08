import React, { useEffect, useState } from "react";
import {
  RiHome4Line,
  RiSettings3Line,
  RiLogoutCircleRLine,
  RiCloseLine,
} from "@remixicon/react";
import SmallJobCard from "./SmallJobCard";
import { useDispatch, useSelector } from "react-redux";
import { getJobListRequest } from "./../store/slices/jobDataSlice";
import SmallJobCardLoader from "./Loaders/SmallJobCardLoader";
import CreateNewJobBtn from "./buttons/sidebar/CreateNewJobBtn";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setCreateNewJob,
  setShowTypeWriter,
  setModalOpen,
} from "./../store/slices/UI Slice/CreateJDSlice";
import { setActiveKey } from "./../store/slices/UI Slice/panelSlice";
import { resetJobState } from "./../store/slices/createJobSlice";
import { resetUploadJD } from "./../store/slices/uploadJdSlice";

const navItems = [
  { href: "#", label: "Dashboard", icon: RiHome4Line, active: true },
  { href: "#", label: "Settings", icon: RiSettings3Line },
];

export default function Sidebar({ isCollapsed, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();

  const location = useLocation();

  const { loading, jobListData } = useSelector((state) => state.jobList);

  const savedJobid = JSON.stringify(localStorage.getItem("jobID"));

  // console.log("jobListData:", jobListData);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getJobListRequest());
  }, []);

  // hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("jobID");
    if (stored) setSelectedJobId(String(stored));
  }, []);

  const [selectedJobId, setSelectedJobId] = useState(null);

  // optional: when list loads and nothing selected, select last used or first job
  useEffect(() => {
    if (!jobListData?.jobs?.length) return;

    if (selectedJobId) {
      // ensure id exists in current list; if not, fall back to first
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
      const pick = stored ? String(stored) : String(jobListData.jobs[0].job_id); // choose first if nothing stored
      setSelectedJobId(pick);
      localStorage.setItem("jobID", pick);
    }
  }, [jobListData, selectedJobId]);

  // handle Job Card Click

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
  // handle create New Job

  const handleCreateNewJobBtn = () => {
    dispatch(setCreateNewJob(true));
    dispatch(setShowTypeWriter(false));
    dispatch(resetUploadJD());
    dispatch(setModalOpen(false));
    navigate("/dashboard");
    dispatch(setActiveKey("jd"));
    dispatch(resetJobState());
  };

  // handle logout 

  const handleLogout = () =>{
    localStorage.clear();
    window.location.reload();  
  }

  const chrome =
    "backdrop-blur-[16px] backdrop-saturate-[180%] bg-[rgba(30,41,59,0.15)] rounded-md border border-[rgba(100,116,139,0.2)] shadow-[0px_12px_40px_0_rgba(2,6,23,0.3),inset_0_0_120px_rgba(79,70,229,0.08),inset_0px_0px_4px_2px_rgba(255,255,255,0.1)]";

  /* ===================== Desktop (md+) ===================== */
  const Desktop = (
    <aside
      className={`hidden md:flex md:sticky md:top-0 md:self-start md:flex-shrink-0
                  h-screen transition-all duration-300 ease-in-out flex-col m-2
                  ${chrome}
                  ${isCollapsed ? "md:w-20" : "md:w-64"}`}
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
          Recruit.Ai
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
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center p-3 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 group
                          ${isCollapsed ? "justify-center" : "px-4"}
                          ${item.active ? "bg-slate-200 dark:bg-slate-700" : ""}
                          last:border-b-2 last:border-slate-400 dark:last:border-slate-600`}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
              <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
                {item.label}
              </span>
            </a>
          );
        })}

        {!isCollapsed && (
          <>
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
                Job Roles
              </span>
            </div>

            <CreateNewJobBtn clickFunc={() => handleCreateNewJobBtn()} />

            {loading && (
              <div className="">
                <SmallJobCardLoader />
                <SmallJobCardLoader />
              </div>
            )}

            {!loading && jobListData && (
              <>
                {jobListData?.jobs?.map((job, index) => {
                  return (
                    <SmallJobCard
                      key={job.job_id}
                      title={job.role}
                      min_experince={job.min_years}
                      max_experince={job.max_years}
                      jobType={job.employment_type}
                      jd_text={job.jd_text}
                      jobId={job.job_id}
                      active={String(selectedJobId) === String(job.job_id)} // 👈 highlight correct one
                      onClick={handleJobCardClick} // 👈 pass handler
                    />
                  );
                })}
              </>
            )}

            {/* Loader Below */}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-700">
        <a
          href="#"
          className={`flex items-center p-3 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 group ${
            isCollapsed ? "justify-center" : "px-4"
          }`}
          onClick={() => handleLogout()}
        >
          <RiLogoutCircleRLine className="w-6 h-6 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
          <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
            Logout
          </span>
        </a>
      </div>
    </aside>
  );

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
              <a
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center p-3 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 group
                            ${
                              item.active
                                ? "bg-slate-200 dark:bg-slate-700"
                                : ""
                            }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
                <span className="ml-3">{item.label}</span>
              </a>
            );
          })}

          <div className="px-2 py-2">
            <div className="px-1 pb-2 text-sm text-slate-700 dark:text-slate-300">
              Job Roles
            </div>
            <CreateNewJobBtn clickFunc={() => onCloseMobile()} />

            {loading && (
              <div className="">
                <SmallJobCardLoader />
                <SmallJobCardLoader />
              </div>
            )}

            {!loading && jobListData && (
              <>
                {jobListData?.jobs?.map((job, index) => {
                  return (
                    <SmallJobCard
                      key={job.job_id}
                      title={job.role}
                      min_experince={job.min_years}
                      max_experince={job.max_years}
                      jobType={job.employment_type}
                      jd_text={job.jd_text}
                      jobId={job.job_id}
                      active={selectedJobId === job.job_id} // 👈 highlight correct one
                      onClick={handleJobCardClick} // 👈 pass handler
                    />
                  );
                })}
              </>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-700">
          <a
            href="#"
            onClick={() => localStorage.clear()}
            className="flex items-center p-3 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 group"
          >
            <RiLogoutCircleRLine className="w-6 h-6 shrink-0 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
            <span className="ml-3">Logout</span>
          </a>
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
