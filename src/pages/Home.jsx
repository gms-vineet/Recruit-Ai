// import React from "react";

// function Home() {
//   return (
//     <div
//       className="
//     absolute inset-0 z-0
//     [--base:#ffffff]        /* light mode base */
//     dark:[--base:#000000]   /* dark mode base (swap if you want the opposite) */
//   "
//       style={{
//         background: `
//       radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
//       radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
//       radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
//       radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
//       var(--base)
//     `,
//       }}
//     >
//       <h1>This is Home Page</h1>
//     </div>
//   );
// }

// export default Home;

import React from "react";
import { RiSparklingLine } from "@remixicon/react";

import { useNavigate } from "react-router-dom";
import AvtaramLogo from "./../assets/company_logos/Avataaram_logo.png";
import PimotorsLogo from "./../assets/company_logos/PiMotors_logo.png";
import GmsLogo from "./../assets/company_logos/GMS_logo.png";

import NavbarWA from './../components/WithoutAuth/NavbarWA';
import SparkleButton from './../components/buttons/SparkleButton';

// import Typewriter from "typewriter-effect";
// Company logos data
const logos = [
  {
    name: "GMS",
    src: GmsLogo,
  },
  {
    name: "Avataaram",
    src: AvtaramLogo,
  },
  {
    name: "Pi Motors",
    src: PimotorsLogo,
  },
];



function Home() {
  const navigate = useNavigate();

  const hanndleGetStarted = () => {
    // navigate("/dashboard");
    navigate("/get-started");
  };

  return (
    <div className="flex flex-col items-center min-h-screen  text-white overflow-x-hidden">
      {/* Background Gradient */}
      <div
        className="absolute top-0 left-0 w-full min-h-screen z-0  [--base:#ffffff]        /* light mode base */
    dark:[--base:#000000]   /* dark mode base (swap if you want the opposite) */"
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

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
      <NavbarWA isHome={true}/>

        {/* Hero Section */}
        <main className="text-center mt-20 sm:mt-24 lg:mt-32">
          <div className="inline-block  bg-purple-200 dark:bg-gray-800 text-stone-500 dark:text-stone-400 text-sm px-4 py-1 rounded-full mb-4 border border-purple-400/30">
            <p className="flex flex-row items-center gap-2">
              Welcome to Recruit.Ai <RiSparklingLine className="h-4 w-4" />
            </p>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-l
            from-purple-300 via-purple-600 to-red-950
            dark:from-slate-800 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent  "
          >
            Transform Your
            <span className="relative text-logotextcolor">
              {" "}
              Hiring
              <svg
                className="absolute left-0 bottom-0 w-full h-auto"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M 5,5 Q 100,10 195,5"
                  className="stroke-current fill-none stroke-2"
                />
              </svg>
            </span>
            <span className="italic"> Strategy</span>
            <br /> with the <span className="italic">Power of AI</span>
          </h1>
          <p className="max-w-xl mx-auto mt-6 text-slate-800 dark:text-slate-300 font-semibold text-sm">
            Boost your campaign performance, increase ROI, and unlock
            data-driven insights with our advanced AI marketing solutions
            {/* <Typewriter
              options={{
                strings: [
                  ""
                ],
                autoStart: true,
                loop: false,
                delay: 50,
                deleteSpeed: Infinity,
                pauseFor: 2000,
              }}
            /> */}
          </p>

          {/* GET STATRTED BUTTON BELOW */}

          {/* <button
            className="bg-gradient-to-b
from-[#818cf8]
via-[#6366f1]
to-[#4f46e5] 

 text-white dark:text-black font-bold px-8 py-3 rounded-full mt-8 hover:bg-cyan-300 transition-colors duration-300"
            onClick={() => hanndleGetStarted()}
          >
            <p className="flex flex-row items-center gap-2">
              Get Started{" "}
              <RiSparklingLine className="h-6 w-6 hover:text-yellow-400" />
            </p>
          </button> */}
          
         <div className="flex justify-center items-center my-6">
           <SparkleButton children={"Get Started"} onClick={()=> hanndleGetStarted()}/>
         </div>
        </main>

        {/* Social Proof / Logos */}
        <footer className="mt-24 sm:mt-32 pb-16">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            <div className="text-center lg:text-left lg:pr-12 lg:border-r border-slate-700">
              <p className="text-3xl font-bold text-slate-600 dark:text-slate-100">
                40,000+
              </p>
              <p className="text-slate-400">
                People use us for engage their team
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {logos.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  className="h-8 grayscale opacity-60 dark:opacity-90 hover:opacity-100 hover:grayscale-0 transition-all"
                />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;
