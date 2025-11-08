import React from "react";
import NavbarWA from "./../components/WithoutAuth/NavbarWA";
import LoginForm from "./../components/forms/authForms/LoginForm";

function AuthForm() {
  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden">
      {/* Background */}
      <div
        className="absolute top-0 left-0 w-full h-full z-0 [--base:#ffffff] dark:[--base:#000000]"
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

      <div className="relative z-10 h-full flex flex-col">
        <header className="sticky top-0 z-20 w-full">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <NavbarWA />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthForm;
