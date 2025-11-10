import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import NavbarWA from "../components/WithoutAuth/NavbarWA";
import { supabase } from "../lib/supabaseClient";

const schema = Yup.object({
  password: Yup.string().min(8, "Use at least 8 characters").required("Password is required"),
});

function parseHash(hash) {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const obj = {};
  p.forEach((v, k) => (obj[k] = v));
  return obj;
}

export default function SbSetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hash } = useLocation();

  const [linkError, setLinkError] = useState(null);
  const [checking, setChecking] = useState(true);

  // optional: /set-password?mode=reset
  const mode = params.get("mode") === "reset" ? "reset" : "setup";

  useEffect(() => {
    // 1) If backend redirected straight to /set-password with hash,
    //    try to set Supabase session here.
    const maybeSetSessionFromHash = async () => {
      const h = parseHash(hash || "");
      if (h.error) {
        setLinkError(h.error_code || h.error);
        return true;
      }
      if (h.access_token && h.refresh_token) {
        await supabase.auth.setSession({
          access_token: h.access_token,
          refresh_token: h.refresh_token,
        });
        return true;
      }
      return false;
    };

    (async () => {
      const touchedHash = await maybeSetSessionFromHash();

      // 2) Check session; if none, they opened /set-password directly → send home
      const { data } = await supabase.auth.getSession();
      if (!data.session && !touchedHash) {
        navigate("/", { replace: true });
        return;
      }
      setChecking(false);
    })();
  }, [hash, navigate]);

  const formik = useFormik({
    initialValues: { password: "" },
    validationSchema: schema,
    onSubmit: async ({ password }, helpers) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        helpers.setStatus(error.message);
        return;
      }
      await supabase.auth.signOut(); // we only used Supabase to set password
      navigate(`/?${mode === "reset" ? "reset" : "setup"}=done`, { replace: true });
    },
  });

  const passwordError = formik.touched.password && formik.errors.password;
  if (checking) return null;

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

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 w-full">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <NavbarWA />
          </div>
        </header>

        {/* centered like Login */}
        <main className="flex-1 grid place-items-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                {mode === "reset" ? "Reset your password" : "Set your password"}
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-200">
                Use the password you will sign in with.
              </p>
            </div>

            {linkError && (
              <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 text-sm">
                {linkError === "otp_expired"
                  ? "This invite link is invalid or has expired. Please request a new invite."
                  : `Invite link error: ${linkError}`}
              </div>
            )}

            {!linkError && (
              <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
                <div className="flex flex-col">
                  <label htmlFor="password" className="mb-2 font-medium text-slate-700 dark:text-slate-300">
                    New password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    className={`text-slate-600 dark:text-slate-200 bg-transparent border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow ${
                      passwordError ? "border-red-500" : "border-slate-400"
                    }`}
                    aria-invalid={!!passwordError}
                  />
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-500">{formik.errors.password}</p>
                  )}
                </div>

                {formik.status && (
                  <div className="text-sm text-red-400 border border-red-400/30 rounded-md p-3">
                    {formik.status}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
                  className="w-full bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Save & Continue
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
