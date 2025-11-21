// RightSidePanel.jsx
import React from "react";
import {
  RiFileList3Line,
  RiFileSearchLine,
  RiBarChart2Line,
  RiCheckDoubleLine,
  RiTaskLine,
  RiFileChartLine,
  RiMailSendLine,
} from "@remixicon/react";

const RightSidePanel = ({
  open,
  onClose,
  title = "Panel",
  activeKey,
  onSelect,
  children,
  showWorkflow = true, // 👈 pass false to hide workflow buttons
}) => {
  const isActive = (id) =>
    activeKey === id
      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 border-purple-300 dark:border-purple-500"
      : "";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Panel */}
      <div
     className={`fixed top-0 right-0 h-full w-full md:w-2/3
    bg-white dark:bg-slate-900 shadow-xl z-50
    border-l border-slate-200/60 dark:border-slate-700/60
    transition-transform duration-300
    ${open ? "translate-x-0" : "translate-x-full"}
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto h-[calc(100%-52px)] space-y-3">
          {showWorkflow && (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Workflow
              </p>

              <button
                onClick={() => onSelect?.("jd")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("jd")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiFileList3Line className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">
                  Job Description Generation
                </span>
              </button>

              <button
                onClick={() => onSelect?.("parse")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("parse")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiFileSearchLine className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">Parse Resumes</span>
              </button>

              <button
                onClick={() => onSelect?.("rank")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("rank")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiBarChart2Line className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">Rank Resumes</span>
              </button>

              <button
                onClick={() => onSelect?.("shortlist")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("shortlist")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiCheckDoubleLine className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">Shortlisting</span>
              </button>

              <button
                onClick={() => onSelect?.("assign")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("assign")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiTaskLine className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">
                  Assign to Interviewr
                </span>
              </button>

              <button
                onClick={() => onSelect?.("reports")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("reports")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiFileChartLine className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">View Reports</span>
              </button>

              <button
                onClick={() => onSelect?.("mails")}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition border border-slate-200/60 dark:border-slate-700/60 ${isActive("mails")}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/15 text-purple-500 dark:text-purple-200">
                  <RiMailSendLine className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">Send Mails</span>
              </button>
            </>
          )}

          {/* 👇 Resume / custom content always rendered */}
          {children}
        </div>
      </div>
    </>
  );
};

export default RightSidePanel;
