import React, { useEffect } from "react";
import Typewriter from "typewriter-effect";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AiLoader from "./../Loaders/AiLoader";
import NewJobForm from "./../forms/NewJobForm";
import CreateJobBtn from "./../buttons/CreateJobBtn";
import TypewriterForm from "./../forms/TypewriterForm";
import JDUploadForm from "./../forms/JDUploadForm"; // ✅ NEW
import {
  setCreateNewJD,
  setUploadJD,
  setModalOpen,
} from "./../../store/slices/UI Slice/CreateJDSlice";

function Job_Description() {
  const UserName = "TestUser";
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(setCreateNewJD(true))
  },[])

  // UI SLICE - create jd
  const { createNewJD, isModalOpen, uploadJD, createNewJob, showTypeWriter } = useSelector(
    (state) => state.createJD
  );

  //getting job Detial From Side Bar
  const location = useLocation();
  const { jDSidebar } = location.state || {};

  const jobIdSidebar  = localStorage.getItem("jobID");

  // Create New Job New JD State Below
  const { job, isJobCreated, regenerating, loading, saving } = useSelector(
    (state) => state.createJob
  );

  // Upload JD States Below
  const jdUploadLoading = useSelector((state) => state.uploadJD.loading);
  const { data, quesLoading, questions } = useSelector(
    (state) => state.uploadJD
  );

  // handle create New JD BTN
  const createNewJDBtnClick = () => {
    dispatch(setModalOpen(true));
    dispatch(setCreateNewJD(true));
    dispatch(setUploadJD(false));
  };

  // handle Upload New JD Btn
  const uploadJDBtnClick = () => {
    dispatch(setModalOpen(true));
    dispatch(setUploadJD(true));
    dispatch(setCreateNewJD(false));
  };

  // handle close main modal
  const handleCloseModal = () => {
    dispatch(setModalOpen(false));
  };

  const isBusy = loading || regenerating || jdUploadLoading || quesLoading;

  return (
    <div className="h-full w-full grid place-items-center">
      {/* Main Section Below ----- */}
      {isBusy ? (
        <div
          className="h-full flex items-center justify-center opacity-30"
          style={{ transform: "scale(1)", transformOrigin: "center" }}
        >
          <AiLoader />
        </div>
      ) : (
        <section className="w-full max-w-5xl px-4 py-10">
          {/* ✅ First-visit buttons: show when no JD yet, no modal, and no preloaded data/sidebar */}
          {!isModalOpen && !isJobCreated && !data && !jDSidebar && !showTypeWriter && (
            <>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-l
              from-purple-300 via-purple-600 to-red-950
              dark:from-slate-800 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent"
              >
                {" "}
                <Typewriter
                  options={{
                    strings: [`Hi there, ${UserName}`],
                    autoStart: true,
                    loop: false,
                    delay: 50,
                    deleteSpeed: Infinity,
                    pauseFor: 2000,
                  }}
                />
                <span className="text-2xl font-semibold text-gray-500">
                  You want to create a Job
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                Create your first job and lets begin your AI hiring journey
              </p>

              <div className="py-6 flex items-center flex-row gap-3 flex-wrap">
                <CreateJobBtn
                  onClick={createNewJDBtnClick}
                  title={"Create a New Job Description"}
                  description={
                    "Start fresh with title, experience, type and more."
                  }
                />
                <CreateJobBtn
                  onClick={uploadJDBtnClick}
                  title={"Upload Existing Job Description"}
                  description={
                    "Just Copy & Paste your existing Job description continue."
                  }
                />
              </div>
            </>
          )}

          {isModalOpen && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative w-[92vw] max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700
                  max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ scrollbarGutter: "stable" }}
              >
                {/* Header */}
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                  {createNewJD && <NewJobForm />}

                  {!data && uploadJD && <JDUploadForm />}

                  {data && (
                    <NewJobForm
                      data={data}
                      job={data?.job || data?.parsed}
                      questions={data?.questions || questions}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* After JD created or from sidebar or uploaded: show Typewriter */}
          {(isJobCreated || jDSidebar || showTypeWriter) && (
            <TypewriterForm
              JDfromSidebar={jDSidebar}
              jobIDSidebar={jobIdSidebar}
            />
          )}
        </section>
      )}
    </div>
  );
}

export default Job_Description;
