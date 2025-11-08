import React from "react";

function SmallJobCardLoader() {
  
    
  return (
    <div>
      <button
        disabled
        aria-busy="true"
        className="
          block rounded-md px-3 py-2 my-2 w-full text-start
          bg-white/70 dark:bg-slate-800/60
          border border-slate-200 dark:border-slate-700/60
          shadow-[0px_12px_40px_0_rgba(2,6,23,0.06),inset_0_0_120px_rgba(79,70,229,0.04),inset_0px_0px_4px_2px_rgba(255,255,255,0.04)]
          backdrop-blur-[16px] backdrop-saturate-[180%]
          hover:bg-white/80 dark:hover:bg-slate-800/70 transition
          pointer-events-none
        "
        style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
      >
        <div className="animate-pulse space-y-2">
          {/* title line */}
          <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-700/60 rounded" />

          {/* meta row 1 (icon + text) */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700/60" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 rounded" />
          </div>

          {/* meta row 2 (icon + text) */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700/60" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700/60 rounded" />
          </div>
        </div>
      </button>
    </div>
  );
}

export default SmallJobCardLoader;
