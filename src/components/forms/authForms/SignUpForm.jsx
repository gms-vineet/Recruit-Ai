import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RiArrowRightLine } from "@remixicon/react";
import { useNavigate, Link } from "react-router-dom";

import { signupRequest } from "./../../../store/slices/authslice";
import { useDispatch, useSelector } from "react-redux";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Za-z]/, "Password must contain a letter")
    .matches(/\d/, "Password must contain a number")
    .required("Password is required"),
  agree: Yup.boolean()
    .oneOf([true], "You must agree to the Terms & Privacy Policy")
    .required("You must agree to the Terms & Privacy Policy"),
});

export default function SignUpForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector((state) => state.auth.status);
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    if (status === true) {
      navigate("/auth", { state: { login: true }, replace: true });
    }
  }, [status, navigate]);

  const formik = useFormik({
    initialValues: { email: "", password: "", agree: false },
    validationSchema, // includes agree + password rules
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true, // ✅ NEW
    onSubmit: (values, { setSubmitting }) => {
      dispatch(
        signupRequest({ email: values.email, password: values.password })
      );
      setSubmitting(false);
    },
  });

  const emailError = formik.touched.email && formik.errors.email;
  const passwordError = formik.touched.password && formik.errors.password;
  const agreeError = formik.touched.agree && formik.errors.agree;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 sm:p-8 w-full h-full">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-xl sm:text-4xl mx-4 font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-100">
            Join and start managing your jobs effortlessly.
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 gap-6"
          noValidate
        >
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="mb-2 font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`bg-transparent border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow text-slate-600 dark:text-slate-200
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
            <label
              htmlFor="password"
              className="mb-2 font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`bg-transparent border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow text-slate-600 dark:text-slate-200
                ${passwordError ? "border-red-500" : "border-slate-400"}`}
              placeholder="Create a strong password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && (
              <p id="password-error" className="mt-2 text-sm text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              id="agree"
              name="agree"
              type="checkbox"
              className={`mt-1 accent-purple-600 ${
                agreeError ? "ring-1 ring-red-500 rounded" : ""
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.agree}
              aria-invalid={!!agreeError}
              aria-describedby={agreeError ? "agree-error" : undefined}
            />
            <label htmlFor="agree" className="select-none">
              I agree to the <span className="underline">Terms</span> &{" "}
              <span className="underline">Privacy Policy</span>
            </label>
          </div>
          {agreeError && (
            <p id="agree-error" className="text-sm text-red-500 -mt-4">
              {formik.errors.agree}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                loading ||
                !formik.isValid ||
                !formik.dirty ||
                formik.isSubmitting
              } 
                           className="bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-shadow duration-300 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Account"}
              <RiArrowRightLine className="h-6 w-6" />
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link
            to="/auth"
            state={{ login: true, replace: true }}
            className="text-purple-500 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
