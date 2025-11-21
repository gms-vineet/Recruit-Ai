// src/pages/Layout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./../components/Sidebar";
import Topbar from "./../components/Topbar";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // ✅ routes where we want NO sidebar at all
  const hideSidebar =
    pathname.startsWith("/interview-room") ||
    pathname.startsWith("/interview/report") ||
    pathname.startsWith("/interview/feedback");

  useEffect(() => {
    if (hideSidebar) {
      // collapse + close drawer whenever we enter any interview flow screen
      setIsCollapsed(true);
      setMobileSidebarOpen(false);
    }
  }, [hideSidebar]);

  const openMobileSidebar = () => setMobileSidebarOpen(true);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-white text-slate-800 dark:bg-black dark:text-slate-200">
      {/* background */}
      <div
        className="absolute inset-0 z-0 [--base:#ffffff] dark:[--base:#000000]"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
            radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
            radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
            radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
            var(--base)
          `,
        }}
      />

      {/* content */}
      <div className="relative z-10 flex h-screen">
        {/* ✅ Only render Sidebar when NOT in interview-room/report/feedback */}
        {!hideSidebar && (
          <Sidebar
            isCollapsed={isCollapsed}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={closeMobileSidebar}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            toggleCollapse={() => setIsCollapsed((v) => !v)}
            openMobileSidebar={openMobileSidebar}
          />

          <main
            className={`flex-1 bg-transparent ra-scroll  ${
              hideSidebar ? "p-2 sm:p-3" : "p-4 sm:p-6"
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
