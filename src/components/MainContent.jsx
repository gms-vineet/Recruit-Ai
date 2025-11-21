import React from "react";
import Job_Description from "./JobSteps_Components/Job_Description";
import ResumeParsing from "./JobSteps_Components/ResumeParsing";
import RankResumes from "./JobSteps_Components/RankResumes";

import { useDispatch, useSelector } from "react-redux";
import RightSidePanel from "./Modal/RightSidePanel";

import { Toaster } from "react-hot-toast";

import { setActiveKey, setOpen } from "./../store/slices/UI Slice/panelSlice";

const COMPONENT_MAP = {
  jd: Job_Description,
  parse: ResumeParsing,
  rank: RankResumes,
  // shortlist: Shortlisting,
  // assign: AssignToInterviewer,
  // reports: Reports,
  // mails: SendMails,
};

function MainContent() {
  const dispatch = useDispatch();

  // ⚠️ Make sure this matches your store key (e.g., s.panel or s.rightPanel)
  const { open, activeKey } = useSelector((s) => s.rightPanel);

  const ActiveComponent = COMPONENT_MAP[activeKey] || Job_Description;

  const handleSelect = (key) => {
    dispatch(setActiveKey(key));
    dispatch(setOpen(false)); // optional: close panel after selection
  };

  return (
    <div className="h-full">
      <ActiveComponent />

      {/* <Toaster position="top-right" reverseOrder={false} /> */}

      {/* <RightSidePanel
        open={open}
        onClose={() => dispatch(setOpen())}
        title="Panel"
        activeKey={activeKey}
        onSelect={handleSelect}
      /> */}
    </div>
  );
}

export default MainContent;
