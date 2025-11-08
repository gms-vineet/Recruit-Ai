import React, { useMemo, useState } from "react";
import { RiMenu2Line, RiSidebarFoldLine } from "@remixicon/react";
import ThemeToggle from "./ThemeToggle";
import { useDispatch, useSelector } from 'react-redux';
import {setOpen} from './../store/slices/UI Slice/panelSlice'


export default function Topbar({ toggleCollapse, openMobileSidebar }) {
  const name = localStorage.getItem("rec_name");

  // const [open, setOpen] = useState(false);


    const dispatch = useDispatch();

  const fullName = useMemo(() => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("userInfo") : null;
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.recruiter?.full_name || "User";
  } catch {
    return "User";
  }
}, []);

  return (
    <header className="sticky top-0 bg-transparent z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile: open drawer */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={openMobileSidebar}
          aria-label="Open sidebar"
        >
          <RiMenu2Line className="w-6 h-6" />
        </button>

        {/* Desktop: collapse sidebar */}
        <button
          className="hidden md:inline-flex p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
        >
          <RiMenu2Line className="w-6 h-6" />
        </button>

        {/* Center slot (title/search) */}
        <div className="flex-1" />

        {/* Theme + avatar */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-500 cursor-pointer flex items-center justify-center text-slate-700 dark:text-white font-bold"
            onClick={() => setOpen(true)}
          >
           {fullName[0] || 'O'}
          </div> */}
          <RiSidebarFoldLine className="text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 h-5 w-5 cursor-pointer" onClick={() => dispatch(setOpen(true))}/>
        </div>
       
      </div>
    </header>
  );
}
