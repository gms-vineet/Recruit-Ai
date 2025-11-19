// src/pages/CandidateDetail.jsx
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ResumeViewer from "../components/JobSteps_Components/Rank_resume/ResumeViewer";
import AiLoader from "../components/Loaders/AiLoader";

import {
  fetchInterviewDetailRequest,
  resetInterviewDetail,
} from "../store/slices/interviewDetailSlice";

import { RiArrowLeftLine } from "@remixicon/react";

export default function CandidateDetail() {
  const { id } = useParams(); // interview_id from URL
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ---- unify slice shape (supports { data: {...} } or flat state) ----
  const detailState = useSelector((s) => s?.interviewDetail || {});
  const loading = detailState.loading;
  const error = detailState.error;

  const root = detailState.data || detailState; // if your reducer kept everything in state.data

  const interview = root.interview || detailState.interview;
  const job = root.job || detailState.job;
  const resume = root.resume || detailState.resume;
  const aiSummary =
    root.aiSummary || root.ai_summary || detailState.aiSummary || null;

  // ---- call detail API on mount ----
  useEffect(() => {
    if (id) {
      dispatch(fetchInterviewDetailRequest(id));
    }
    return () => {
      dispatch(resetInterviewDetail());
    };
  }, [dispatch, id]);

  // ---- map API payload -> shape that ResumeViewer expects ----
  const dataForViewer = useMemo(() => {
    if (!resume) return [];

    const merged = { ...resume };

    if (interview?.interview_id) {
      merged.interview_id = interview.interview_id;
    }

    // Basic identity
    merged.full_name =
      resume.full_name ||
      root.candidate?.full_name ||
      interview?.candidate_name ||
      resume.email ||
      resume.candidate_email;

    merged.email =
      resume.email ||
      resume.candidate_email ||
      root.candidate?.email ||
      interview?.candidate_email;

    // Raw texts -> names used by ResumeViewer
    merged.resume_raw =
      merged.resume_raw || resume.raw_text || resume.raw || "";

    if (job) {
      merged.role =
        merged.role || job.role || job.title || job.job_title || null;
      merged.jd_raw = merged.jd_raw || job.jd_text || job.jd_raw || "";
    }

    // Interview info (status + Meet)
    if (interview) {
      merged.status = merged.status || interview.status;

      // keep both meetLink + meet_link so old code keeps working
      merged.meet_link = merged.meet_link || interview.meet_link;
      merged.meetLink = merged.meetLink || interview.meet_link;

      merged.interview_start_at = interview.start_at;
      merged.interview_end_at = interview.end_at;
    }

    // AI summary
    merged.ai_summary =
      merged.ai_summary || aiSummary || resume.ai_summary || "";

    // meta used by PreflightModal
    merged.meta = {
      ...(resume.meta || {}),
      meet_url:
        (resume.meta && resume.meta.meet_url) ||
        interview?.meet_link ||
        merged.meetLink,
    };

    return [merged];
  }, [resume, job, interview, aiSummary, root]);

  const handleBack = () => navigate("/dashboard");

  // ---- loading / error states ----
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <AiLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 ra-scroll py-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline"
        >
          <RiArrowLeftLine className="h-4 w-4" />
          Back to dashboard
        </button>
        <p className="mt-4 text-sm text-red-500">Error: {error}</p>
      </div>
    );
  }

  // If API returned 200 but no resume object
  if (!resume) {
    return (
      <div className="max-w-6xl mx-auto px-4 ra-scroll py-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline"
        >
          <RiArrowLeftLine className="h-4 w-4" />
          Back to dashboard
        </button>
        <p className="mt-4 text-sm text-slate-500">
          No resume found for this interview.
        </p>
      </div>
    );
  }

  // ---- MAIN UI: pure ResumeViewer ----
  return (
    <div className="max-w-6xl mx-auto px-4 ra-scroll py-6">
      <button
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline"
      >
        <RiArrowLeftLine className="h-4 w-4" />
        Back to dashboard
      </button>

      <ResumeViewer data={dataForViewer} />
    </div>
  );
}
