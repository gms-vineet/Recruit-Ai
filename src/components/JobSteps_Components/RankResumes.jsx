import React, { useEffect, useState } from "react";
import ResumeViewer from "./Rank_resume/ResumeViewer";
import ResumeFilter from "./Rank_resume/ResumeFilter";
import ResumeViewTable from "./Rank_resume/ResumeViewTable";
import { useDispatch, useSelector } from "react-redux";
import AiLoader from "./../Loaders/AiLoader";
import { getParseResListRequest } from "./../../store/slices/parseResumeSlice";
import { useLocation } from "react-router-dom";

function RankResumes() {
  const dispatch = useDispatch();

  const {
    getParsedResListData,
    getParsedResListLoading,
    getRankedResData,
    getRankedResLoading,
    re_rankResData,
    re_rankResLoading,
  } = useSelector((state) => state.resumeParse);

//   const location = useLocation();
//   const { jobIdSidebar } = location.state || {};

//   const jobIdSidebar  = JSON.stringify(localStorage.getItem("jobID"));
const jobIdSidebar = localStorage.getItem("jobID");   
// const jobIdSidebar = Number(raw);

  const [data, setData] = useState(null);

  useEffect(() => {
    dispatch(getParseResListRequest({job_id: jobIdSidebar}));
  }, []);

  useEffect(() => {
    const next = getRankedResData?.rows?.length
      ? getRankedResData.rows
      : getParsedResListData?.rows?.length
      ? getParsedResListData.rows
      : [];
    setData(next);
  }, [getRankedResData, getParsedResListData, re_rankResData]);

  console.log("getParsedResListData: ", getParsedResListData);

  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");

  return (
    <div className="md:p-4 p-0 h-full">
      {getParsedResListLoading || getRankedResLoading || re_rankResLoading ? (
        <AiLoader />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Resume Ranking
              </h2>
            </div>
          </div>

          <ResumeFilter
            status={status}
            setStatus={setStatus}
            statuses={["STATUS", "PARSED", "PENDING", "REJECTED"]}
            count={count}
            setCount={setCount}
            onRank={(n) => console.log("Rank top N:", n)}
            onRerank={() => console.log("Re-rank clicked")}
            jobID={jobIdSidebar}
          />

          {/* <ResumeViewer data={data} /> */}

          <ResumeViewTable
            data={data}
            onShortlist={(selected) => console.log(selected)}
          />
        </>
      )}
    </div>
  );
}

export default RankResumes;
