// src/components/forms/JDUploadForm.jsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {uploadJdRequest} from './../../store/slices/uploadJdSlice'
import { useDispatch } from 'react-redux';

export default function JDUploadForm({ onContinue }) {

  const dispatch = useDispatch();

  const MIN_LEN = 10;

  const formik = useFormik({
    initialValues: { jd_text: "" },
    validationSchema: Yup.object({
      jd_text: Yup.string()
        .transform((v) => (typeof v === "string" ? v.trim() : v))
        .min(MIN_LEN, `Please enter at least ${MIN_LEN} characters.`)
        .required("Job Description is required."),
    }),
    onSubmit: (values) => {
      
      dispatch(uploadJdRequest(values));

    },
  });

  const hasError = !!(formik.touched.jd_text && formik.errors.jd_text);
  const length = (formik.values.jd_text || "").trim().length;

  return (
    <form onSubmit={formik.handleSubmit} className="mt-6">
      <div className="group relative border border-slate-300 dark:border-slate-800 rounded-2xl p-5 bg-white/70 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3">
          <div className="text-sm text-slate-700 dark:text-slate-200">
            Enter your <span className="font-semibold">Job Description</span> text
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            You can paste from a document or type directly here.
          </div>

          {/* Textarea input */}
          <div className="relative">
            <textarea
              id="jd_text"
              name="jd_text"
              rows={10}
              value={formik.values.jd_text}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Paste or type the JD here. For example: We are hiring a Frontend Engineer with 3+ years of React experience..."
              className={`w-full rounded-xl bg-transparent border p-3 text-sm outline-none
                text-slate-700 dark:text-slate-100
                ${
                  hasError
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-400/40"
                    : "border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/40"
                }
              `}
              style={{ resize: "vertical" }}
            />

            {/* Helper / error + counter */}
            <div className="mt-1 flex items-center justify-between">
              <span
                className={`text-xs ${
                  hasError ? "text-rose-500" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {hasError
                  ? formik.errors.jd_text
                  : `Paste or type your Job Description below (min ${MIN_LEN} chars).`}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {length} chars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => formik.resetForm()}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={!(formik.isValid && formik.dirty)}
          className="bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5]
                     text-white dark:text-black font-semibold px-6 py-2 rounded-full
                     text-sm transition-colors duration-300 disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
