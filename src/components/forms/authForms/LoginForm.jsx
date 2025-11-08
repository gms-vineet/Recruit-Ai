import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RiArrowRightLine } from "@remixicon/react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "./../../../store/slices/authslice";

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  remember: Yup.boolean(),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [params] = useSearchParams();
  const resetDone = params.get("reset") === "done";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && !loading && token) {
      navigate("/get-started", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const formik = useFormik({
    initialValues: { email: "", password: "", remember: false }, // ✅ include remember
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values, { setSubmitting }) => {
      dispatch(loginRequest(values));
      setSubmitting(false);
    },
  });

  const emailError = formik.touched.email && formik.errors.email;
  const passwordError = formik.touched.password && formik.errors.password;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 sm:p-8 w-full">
      <div className="relative z-10 w-full max-w-md">
        {resetDone && (
          <div className="mb-4 rounded-md border border-green-500/40 bg-green-500/10 text-green-300 px-4 py-3 text-sm">
            Password updated. Please sign in.
          </div>
        )}
        <div className="text-center mb-10">
          <h1 className="text-xl sm:text-4xl mx-4 font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-100">
            Login to continue to your dashboard.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 gap-6" noValidate>
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`text-slate-600 dark:text-slate-2 00 bg-transparent border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow
                ${emailError ? "border-red-500" : "border-slate-400"}`}
              placeholder="you@example.com"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && (
              <p id="email-error" className="mt-2 text-sm text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`text-slate-600 dark:text-slate-200 bg-transparent border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow
                ${passwordError ? "border-red-500" : "border-slate-400"}`}
              placeholder="••••••••"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && (
              <p id="password-error" className="mt-2 text-sm text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 select-none text-slate-600 dark:text-slate-300">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="accent-purple-600"
                onChange={formik.handleChange}
                checked={formik.values.remember}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-purple-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formik.isValid || !formik.dirty || formik.isSubmitting}
              className="bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-shadow duration-300 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Please Wait..." : "Login"}
              <RiArrowRightLine className="h-6 w-6" />
            </button>
          </div>
        </form>

        {/* ❌ Removed Sign-up block */}
      </div>
    </div>
  );
}
