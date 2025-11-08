import React from 'react';
import { RiAddLine } from '@remixicon/react';

function CreateJobBtn({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        relative cursor-pointer rounded-[16px] border-none p-[2px] 
        bg-[radial-gradient(circle_80px_at_80%_-10%,#ffffff,#181b1b)] 
        font-sans text-sm
        before:content-[''] before:absolute before:w-[65%] before:h-[60%] before:rounded-[120px] 
        before:top-0 before:right-0 before:shadow-[0_0_20px_#ffffff38] before:z-[-1]
      "
      aria-label="Create New Job"
    >
      {/* blue radial blob on the left */}
      <div
        className="
          absolute bottom-0 left-0 w-[70px] h-full rounded-[16px]
          bg-[radial-gradient(circle_60px_at_0%_100%,#961fa3,#0000ff80,transparent)]
          shadow-[-10px_10px_30px_#0051ff2d]
        "
      />

      {/* inner content */}
      <div
        className="
          relative z-[3] rounded-[14px] px-[25px] py-[14px]
          bg-[radial-gradient(circle_80px_at_80%_-50%,#777777,#0f1111)]
          before:content-[''] before:absolute before:inset-0 before:rounded-[14px]
          before:bg-[radial-gradient(circle_60px_at_0%_100%,#00e1ff1a,#0000ff11,transparent)]
          before:z-[-1]
          flex items-center justify-between gap-3
        "
      >
        {/* left: requested text block */}
        <div className="flex flex-col items-start">
          <div className="text-sm font-semibold text-white dark:text-slate-100">
            {title}
          </div>
          <p className="mt-1 text-xs text-slate-100 dark:text-slate-400">
            {description}
          </p>
        </div>

        {/* right: add icon */}
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80">
          <RiAddLine className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}

export default CreateJobBtn;
