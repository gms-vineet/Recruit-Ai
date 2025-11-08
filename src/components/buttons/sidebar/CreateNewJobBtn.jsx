import React from 'react'
import { RiAddLine } from "@remixicon/react";
import { useNavigate } from 'react-router-dom';

function CreateNewJobBtn({clickFunc}) {

  const navigate = useNavigate();

   const handleClick = () => {
    clickFunc();
    navigate("/dashboard", {
      state: { createNewJob: true },
    });
  };
  

  return (
      <button
      onClick={()=> {
        handleClick()
      }}
      className={`
        block rounded-md px-3 py-2 my-2 w-full text-start
        bg-slate-50 dark:bg-slate-700/50 dark:text-white
        border border-[rgba(100,116,139,0.2)]
        shadow-[0px_12px_40px_0_rgba(2,6,23,0.3),inset_0_0_120px_rgba(79,70,229,0.04),inset_0px_0px_4px_2px_rgba(255,255,255,0.05)]
        backdrop-blur-[16px] backdrop-saturate-[180%]
        hover:bg-purple-50 hover:border-purple-200
        dark:hover:bg-purple-900/30 dark:hover:border-purple-500/40
        transition
      `}
      style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-purple-500/15 dark:bg-purple-400/15 flex items-center justify-center">
          <RiAddLine className="h-5 w-5 text-purple-500 dark:text-purple-300" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-100">
            Create new job
          </p>
        </div>
      </div>
    </button>

  )
}

export default CreateNewJobBtn
