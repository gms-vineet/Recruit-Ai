import React, { useEffect, useRef, useState } from "react";
import {
  RiEqualizerLine,
  RiRocketLine,
  RiRefreshLine,
  RiFlag2Line,
  RiArrowDownSLine,
  RiFileList3Line,
  RiCloseLine,
  RiCheckLine,
  RiMenuLine,
} from "@remixicon/react";


import {getRankedResRequest, reRankResRequest, getParseResListRequest} from './.././../../store/slices/parseResumeSlice'
import { useDispatch } from 'react-redux';

/**
 * ResumeFilter (Tailwind + @remixicon/react)
 *
 * Usage:
 * <ResumeFilter
 *   status={status}
 *   setStatus={setStatus}
 *   statuses={["All","PARSED","SHORTLISTED","REJECTED"]}
 *   count={count}
 *   setCount={setCount}
 *   onRank={(n) => console.log("Rank top N:", n)}
 *   onRerank={() => console.log("Re-rank clicked")}
 * />
 *
 * - Controlled inputs for Status and No. of Resumes.
 * - "Rank Resume" opens a modal to ask how many resumes to rank.
 * - "Re-Rank Resumes" is a separate action button.
 */
export default function ResumeFilter({
  status = "All",
  setStatus,
  statuses = ["PENDING", "PARSED", "REJECTED"],
  count = 0,
  setCount,
  onRank,
  onRerank,
  
}) {

  const jobID = localStorage.getItem("jobID");

  const dispatch = useDispatch();

  const [rankOpen, setRankOpen] = useState(false);
  const [tempN, setTempN] = useState(count);
  const inputRef = useRef(null);

  const [statusState, setStatusState] = useState(status);
  const [countState, setCountState] = useState(
    typeof count === "number" ? count : 0
  );

  useEffect(() => setStatusState(status), [status]);
  useEffect(() => {
    if (typeof count === "number") setCountState(count);
  }, [count]);

  const setStatusSafe = (val) =>
    typeof setStatus === "function" ? setStatus(val) : setStatusState(val);

  const setCountSafe = (val) =>
    typeof setCount === "function" ? setCount(val) : setCountState(val);

  useEffect(() => {
    if (rankOpen && inputRef.current) inputRef.current.focus();
  }, [rankOpen]);

  const submitRank = () => {
    const raw = parseInt(tempN || 0, 10);
    const n = Math.max(1, Math.min(200, Number.isFinite(raw) ? raw : 1)); // clamp 1..200
    setTempN(String(n));
    if (onRank) onRank(n);
    if (setCount) setCount(n);
    setRankOpen(false);

    dispatch(getParseResListRequest({job_id: jobID, limit: tempN}));
  };
  const KeyTrap = (e) => {
    if (!rankOpen) return;
    if (e.key === "Escape") setRankOpen(false);
    if (e.key === "Enter") submitRank();
  };

  // handle get Re Rank Resume

  const handleReRankResume = () =>{
    dispatch(reRankResRequest(jobID));
  };

  const handleSubmitFilter = () => {
    dispatch(getParseResListRequest({job_id: jobID, limit: count, status: status}));

  }


  return (
    <section
      className="flex w-full my-4  flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      onKeyDown={KeyTrap}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <RiEqualizerLine className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Filters
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRankOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-900/40 dark:bg-purple-900/30 dark:text-purple-200"
          >
            <RiRocketLine className="h-4 w-4" />
            Rank Resume
          </button>
          <button
            type="button"
            onClick={() => handleReRankResume()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <RiRefreshLine className="h-4 w-4" />
            Re-Rank Resumes
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Status */}
        <div className="flex flex-row items-center  gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Status
            </span>
            <div className="relative">
              <RiFlag2Line className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select
                value={status}
                onChange={(e) => setStatusSafe(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 outline-none transition hover:bg-slate-50 focus:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800/70"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <RiArrowDownSLine className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
          </label>

          {/* No. of Resumes */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No. of Resumes (max 200)
            </span>
            <div className="relative">
              <RiFileList3Line className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") return setCountSafe("");
                  const num = parseInt(val, 10);
                  if (!Number.isFinite(num)) return setCountSafe("");
                  const clamped = Math.min(200, Math.max(1, num)); // clamp 1..200 while typing
                  setCountSafe(clamped);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition hover:bg-slate-50 focus:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="e.g. 10"
              />
            </div>
          </label>

          {status && count ? (
            <button
              type="button"
              onClick={() => handleSubmitFilter()}
              className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-900/40 dark:bg-purple-900/30 dark:text-purple-200 mt-5"
            >
              {/* <RiRocketLine className="h-4 w-4" /> */}
              Submit
            </button>
          ) : (
            ""
          )}
        </div>

        {/* Mobile utility (optional): open filter drawer somewhere else if needed */}
        <div className="md:hidden">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <RiMenuLine className="h-4 w-4" />
            More
          </button>
        </div>
      </div>

      {/* Modal: Ask for No. of Resumes when clicking Rank */}
      {rankOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setRankOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-2">
                <RiRocketLine className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Rank Top Resumes
                </h3>
              </div>

              <label className="mb-3 block text-xs font-medium text-slate-500 dark:text-slate-400">
                No. of resumes to rank (max 200)
              </label>
              <input
                ref={inputRef}
                type="number"
                min={1}
                max={200}
                inputMode="numeric"
                pattern="[0-9]*"
                value={tempN}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setTempN(0); // allow empty while typing
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!Number.isFinite(num)) return;
                  const clamped = Math.min(200, Math.max(1, num)); // clamp 1..200
                  setTempN(clamped);
                }}
                onBlur={() => {
                  // snap empty/invalid to 1 on blur
                  if (tempN === null || tempN < 1) setTempN(1);
                }}
                className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Enter a number"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRankOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <RiCloseLine className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRank}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 dark:border-purple-900/40"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
