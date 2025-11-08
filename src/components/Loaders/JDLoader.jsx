import React from "react";

function JDLoader() {
  return (
    <div className="flex flex-col p-4 sm:p-8 w-full animate-pulse">
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {/* title line */}
          <div className="h-7 sm:h-10 bg-slate-200 dark:bg-slate-700/60 rounded mx-auto w-3/4" />
          {/* subtitle line */}
          <div className="mt-4 h-4 bg-slate-100 dark:bg-slate-700/30 rounded mx-auto w-1/2" />
        </div>

        {/* Buttons row */}
        <div className="flex flex-wrap justify-end gap-4 py-4">
          <div className="h-9 sm:h-10 w-28 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
          <div className="h-9 sm:h-10 w-24 bg-slate-100 dark:bg-slate-700/40 rounded-lg" />
          <div className="h-9 sm:h-10 w-24 bg-slate-100 dark:bg-slate-700/40 rounded-lg" />
        </div>

        {/* Content box */}
        <div className="p-6 mb-4 border border-slate-200 dark:border-slate-700/60 rounded-md bg-white/40 dark:bg-slate-900/30">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-4/5" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700/40 rounded w-3/5" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700/30 rounded w-2/5" />
            <div className="h-4 bg-slate-100 dark:bg-slate-700/20 rounded w-3/4" />
            <div className="h-4 bg-slate-100 dark:bg-slate-700/20 rounded w-1/2" />

            {/* fake editor toolbar */}
            <div className="pt-4 flex gap-2">
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-700/20 rounded" />
              <div className="h-8 w-10 bg-slate-100 dark:bg-slate-700/20 rounded" />
              <div className="h-8 w-10 bg-slate-100 dark:bg-slate-700/20 rounded" />
              <div className="h-8 w-10 bg-slate-100 dark:bg-slate-700/20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JDLoader;
