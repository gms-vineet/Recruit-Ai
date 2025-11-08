import React, { useEffect, useState } from "react";
import NameForm from "./../components/forms/NameForm";

import NavbarWA from "./../components/WithoutAuth/NavbarWA";
import DetailsForm from "./../components/forms/DetailsForm";
import { useDispatch, useSelector } from "react-redux";
import { getUserDataRequest } from "./../store/slices/userInfoSlice";
import { useNavigate } from "react-router-dom";
import AiLoader from "./../components/Loaders/AiLoader";

export default function StartingForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserDataRequest());
  }, [dispatch]);

  const handleContinue = (valueFromForm) => {
    setName(valueFromForm); // optional: store the name
    setStep((s) => s + 1); // or setStep(2) if you want a fixed next step
  };

  // userData Loading
  const usserDataLoading = useSelector((state) => state.userData.loading);
  const { userData } = useSelector((state) => state.userData);

  useEffect(() => {
    
    if(userData){
      if (!usserDataLoading && userData?.has_company === true) {
      navigate("/dashboard");
    }
    }
  }, [userData]);

  console.log("userData:", userData);

  return (
    <div className="relative min-h-screen w-full overflow-y-hidden text-white [--nav-h:64px]">
      {/* Background */}
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
      {(usserDataLoading || !userData ) ? (
        <div
          className="opacity-30"
          
        >
          <AiLoader />
        </div>
      ) : (
        <>
          {/* Fixed glass navbar wrapper */}
          <div className="sticky top-0 z-20">
            <div className="mx-auto max-w-7xl px-8">
              <NavbarWA /> {/* unchanged */}
            </div>
          </div>

          {/* Main content (pushed below nav) */}
          <main className="relative z-10 min-h-screen pt-6">
            <section className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6">
              {step === 1 && (
                <div className="text-center">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                    Before we start...
                  </h1>
                  <p className="mt-2 text-lg text-slate-700 dark:text-slate-400">
                    What should we call you?
                  </p>
                </div>
              )}

              <div className="mt-6 w-full">
                {step === 1 && <NameForm onContinue={handleContinue} />}
                {step === 2 && <DetailsForm />}
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}
