// SmallJobCard.jsx
import React from "react";
import { RiBriefcase4Line, RiUser2Line } from "@remixicon/react";

function SmallJobCard({
  title = "Job roles",
  min_experince = 2,
  max_experince = 3,
  jobType = "Full-time",
  jobId,
  jd_text,
  active = false,           // 👈 comes from parent
  onClick,                  // 👈 comes from parent
}) {
  return (
    <div>
      <button
        onClick={() => onClick(jobId, jd_text)}
        className={`
          block rounded-md px-3 py-2 my-2 w-full text-start
          border
          shadow-[0px_12px_40px_0_rgba(2,6,23,0.3),inset_0_0_120px_rgba(79,70,229,0.08),inset_0px_0px_4px_2px_rgba(255,255,255,0.1)]
          backdrop-blur-[16px] backdrop-saturate-[180%]
          transition
          ${
            active
              ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200/70 dark:border-purple-500/40 text-slate-900 dark:text-white"
              : "bg-slate-50 dark:bg-slate-700 dark:text-white border-[rgba(100,116,139,0.2)] hover:bg-slate-100 dark:hover:bg-slate-600/90"
          }
        `}
        style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
      >
        <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-100">
          {title}
        </p>

        <p className="text-[14px] text-slate-500 dark:text-slate-300 flex flex-row gap-2 items-center">
          <RiUser2Line className="h-4 w-4" />
          {min_experince} - {max_experince} Years
        </p>

        <p className="text-[14px] text-slate-500 dark:text-slate-300 flex flex-row gap-2 items-center">
          <RiBriefcase4Line className="h-4 w-4" />
          {jobType}
        </p>
      </button>
    </div>
  );
}

export default SmallJobCard;
