// pages/CandidateDetail.jsx
import React, { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ResumeViewer from "../components/JobSteps_Components/Rank_resume/ResumeViewer";
import { getCandidateById } from "../utils/dummyCandidates";
import { RiArrowLeftLine } from "@remixicon/react";

export default function CandidateDetail() {
  const { id } = useParams();
  const { state } = useLocation();

  // Prefer router state (already normalized), else lookup dummy
  const resolved = state?.candidate || getCandidateById(id);
  const dataForViewer = useMemo(() => (resolved ? [resolved] : []), [resolved]);

  return (
    <div className="max-w-6xl mx-auto px-4 ra-scroll py-6">
      {/* <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline">
        <RiArrowLeftLine className="h-4 w-4" />
        Back to dashboard
      </Link> */}

      <div className="mt-4 ">
        <ResumeViewer data={dataForViewer} />
      </div>
    </div>
  );
}
