// src/pages/InviteReset.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import NavbarWA from "./../components/WithoutAuth/NavbarWA";
// import { useDispatch } from "react-redux";
// import { resetInvitePasswordRequest } from "../store/slices/authslice";

const schema = Yup.object({
  password: Yup.string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
});

export default function InviteReset() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  // If you embed email in the link as base64 (?e=)
  const encodedEmail = searchParams.get("e");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (encodedEmail) {
      try {
        setEmail(atob(encodedEmail));
      } catch {
        setEmail("");
      }
    }
    // If NOT passing email in the URL, you can optionally fetch it from server via token
    // fetch(`/api/invite/email?token=${token}`).then(...)
  }, [encodedEmail]);

  const formik = useFormik({
    initialValues: { password: "" },
    validationSchema: schema,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: async (values, helpers) => {
      const payload = { token, email: email || undefined, password: values.password };

      // 🚀 Call your saga/API here
      // await dispatch(resetInvitePasswordRequest(payload));

      // For demo: pretend success then navigate to login with a flag
      navigate("/?reset=done", { replace: true });
      helpers.setSubmitting(false);
    },
  });

  const passwordError = formik.touched.password && formik.errors.password;

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

        <main className="flex-1 grid place-items-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                Set your password
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-200">
                {email ? `For ${email}` : "Use the password you want to sign in with."}
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
              {/* Only password field as you requested */}
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

              <button
                type="submit"
                disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
                className="w-full bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Save & Continue
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
