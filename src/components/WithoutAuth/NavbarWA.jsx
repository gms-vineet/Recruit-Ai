import React from "react";
import ThemeToggle from "./../ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
function NavbarWA({ isHome }) {

  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between py-6">
      <Link className="text-2xl font-bold text-logotextcolor" to={"/"}>
        Recruit.Ai
      </Link>
      <div className="flex items-center space-x-8 text-slate-300">
        {/* <a href="#" >AI Solutions</a>
            <a href="#" className="hover:text-white">Feature</a>
            <a href="#" className="hover:text-white">Use Cases</a> */}
        <div className="relative group flex items-center gap-2">
          <ThemeToggle />
          {/* Dropdown can be implemented here */}

          {isHome && (
            <>
              <button className="py-2 px-3 text-slate-700 dark:text-slate-100 font-semibold rounded-full border border-slate-800 dark:border-slate-100"
              onClick={()=> navigate("/auth", { state: { login: true } })}
              >
                Login
              </button>
              {/* <button className="py-2 px-3 text-slate-700 dark:text-slate-100 font-semibold rounded-full border border-slate-800 dark:border-slate-100"
              onClick={()=> navigate('/auth', {state:{signup: true}})}
              
              >
                Sign Up
              </button> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavbarWA;
