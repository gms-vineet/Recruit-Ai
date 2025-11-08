import React from "react";

import { RiSunLine, RiMoonLine } from "@remixicon/react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
    >
      {theme === "light" ? (
        <RiMoonLine className="w-5 h-5" />
      ) : (
        <RiSunLine className="w-5 h-5" />
      )}
    </button>
  );
}
