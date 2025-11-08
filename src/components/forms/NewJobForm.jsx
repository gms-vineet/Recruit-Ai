import React, { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RiArrowRightLine, RiCloseLine } from "@remixicon/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createJobRequest, saveJDRequest } from "../../store/slices/createJobSlice";
import { ansJdQuesRequest } from "../../store/slices/uploadJdSlice";

/* =========================
   Helpers
   ========================= */

// Normalize work mode labels from the parser / UX into schema values
const normalizeWorkMode = (v) => {
  if (!v) return "";
  const s = String(v).toLowerCase().trim();
  if (s.includes("remote") || s.includes("online") || s.includes("wfh"))
    return "online";
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("onsite") || s.includes("office") || s.includes("offline"))
    return "offline";
  return s; // fallback
};

// Clean up skills coming as JSON-string or messy text
const parseSkills = (raw) => {
  if (!raw) return [];
  let arr = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      // fallback split on commas or pipes
      arr = raw.split(/[,|]/);
    }
  }

  const cleaned = arr
    .flatMap((s) => String(s).split(/[.;/]| and /i))
    .map((s) => s.replace(/^(must|nice)\s*to\s*have\s*:?\s*/i, "")) // strip "Nice to have:"
    .map((s) => s.replace(/\b\d+\s*\+?\s*years?.*$/i, "")) // strip trailing "3 years..."
    .map((s) => s.trim())
    .filter(Boolean);

  // de-dupe case-insensitively
  return Array.from(new Map(cleaned.map((x) => [x.toLowerCase(), x])).values());
};

// === Answers builder (only include fields asked in `questions`) ===
const isEmptyVal = (v) =>
  v == null || (typeof v === "string" && v.trim() === "");

const numericAnswerFields = new Set(["min_experience", "max_experience"]);

const coerceAnswerValue = (field, v) => {
  if (field === "work_mode") return normalizeWorkMode(v);
  if (numericAnswerFields.has(field)) {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return typeof v === "string" ? v.trim() : v;
};

const buildAnswers = ({ questions, values, job }) => {
  const qs = Array.isArray(questions) ? questions : [];
  return qs.reduce((acc, q) => {
    const field = q?.field;
    if (!field) return acc;

    const coerced = coerceAnswerValue(field, values[field]);
    if (isEmptyVal(coerced)) return acc;

    // Only include if missing in parsed/job OR changed after normalization
    const original = job?.[field];
    const originalNorm =
      field === "work_mode" ? normalizeWorkMode(original) : original;

    if (original == null || String(originalNorm) !== String(coerced)) {
      acc[field] = coerced;
    }
    return acc;
  }, {});
};

/* =========================
   Yup schema
   (Requirements & Nice-to-have skills are NOT required)
   ========================= */
const jobSchema = Yup.object({
  job_title: Yup.string().trim().required("Job title is required"),
  min_experience: Yup.number()
    .typeError("Enter a valid number")
    .integer("Must be an integer")
    .min(0, "Must be ≥ 0")
    .required("Minimum experience is required"),
  max_experience: Yup.number()
    .typeError("Enter a valid number")
    .integer("Must be an integer")
    .min(Yup.ref("min_experience"), "Max must be ≥ Min"),
    // .required("Maximum experience is required"),
  employment_type: Yup.string()
    .oneOf(
      ["Full-time", "Part-time", "Contract", "Internship"],
      "Select a valid type"
    )
    .required("Employment type is required"),
  work_mode: Yup.string()
    .transform((val) => normalizeWorkMode(val))
    .oneOf(["online", "hybrid", "offline"], "Select a valid mode")
    .required("Work mode is required"),
  // Optional textarea
  requirements: Yup.string()
    .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v))
    .notRequired(),
});

function NewJobForm({ job, questions = [], onContinue }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const companyDetailsRaw =
    typeof window !== "undefined" ? localStorage.getItem("companyDetails") : null;
  const companyDetails = companyDetailsRaw ? JSON.parse(companyDetailsRaw) : null;

  const { loading } = useSelector((state) => state.createJob);

  // Local state for chips
  const [mustHaveSkills, setMustHaveSkills] = useState([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState([]);

  // Build initial values from either "parsed" or your older job shape
  const initialValues = useMemo(() => {
    // Accept both shapes:
    // parsed: { job_title, min_experience, max_experience, employment_type, work_mode, jd_text, ... }
    // legacy: { role, min_years, max_years, employment_type, work_mode, jd_text, ... }
    const jt = job?.job_title ?? job?.role ?? "";
    const min =
      job?.min_experience != null
        ? String(job.min_experience).replace(/\.0$/, "")
        : job?.min_years != null
        ? String(job.min_years).replace(/\.0$/, "")
        : "";
    const max =
      job?.max_experience != null
        ? String(job.max_experience).replace(/\.0$/, "")
        : job?.max_years != null
        ? String(job.max_years).replace(/\.0$/, "")
        : "";
    return {
      job_title: jt,
      min_experience: min,
      max_experience: max,
      employment_type: job?.employment_type ?? "",
      work_mode: normalizeWorkMode(job?.work_mode),
      requirements: job?.jd_text ?? job?.requirements ?? "",
    };
  }, [job]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // allow form to refill when job prop arrives/changes
    validationSchema: jobSchema,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values, { setSubmitting }) => {
      // Build payload for creating the job (no AI follow-ups)
      const payload = {
        ...values,
        min_experience: Number.isNaN(parseInt(values.min_experience, 10))
          ? 0
          : parseInt(values.min_experience, 10),
        max_experience: Number.isNaN(parseInt(values.max_experience, 10))
          ? 0
          : parseInt(values.max_experience, 10),
        // normalize work_mode again before submit
        work_mode: normalizeWorkMode(values.work_mode),
        skills_must_have: mustHaveSkills.filter(Boolean),
        skills_nice_to_have: niceToHaveSkills.filter(Boolean),
        // prefer companyDetails, fall back to job object fields
        company_name:
          companyDetails?.company_name ||
          job?.company_name ||
          job?.company ||
          "",
        company_description: companyDetails?.description || "",
        location: companyDetails?.location || job?.location || "",
      };

      // Build "answers" from the AI questions only
      const answers = buildAnswers({ questions, values, job });

      if (Array.isArray(questions) && questions.length > 0) {
        // When AI still needs clarification, send ONLY the answers + the original text + parsed
        const originalText = job?.original_jd_text ?? job?.jd_text ?? "";
        dispatch(
          ansJdQuesRequest({
            original_jd_text: originalText,
            parsed: job,
            answers, // <-- only the needed fields, e.g. { min_experience: 5, work_mode: "online" }
          })
        );
        // Stay on the modal and wait for next AI response
        setSubmitting(false);
        return;
      }else{
        if(job){dispatch(saveJDRequest(job?.job_id));}
      }

      // Otherwise, create the job normally


      if(!job){dispatch(createJobRequest(payload));}


      
      setSubmitting(false);
      // if (typeof onContinue === "function") onContinue();
      navigate("/dashboard");
    },
  });

  // Seed chip arrays from job once when job changes
  useEffect(() => {
    if (!job) return;
    setMustHaveSkills(parseSkills(job.skills_must_have));
    setNiceToHaveSkills(parseSkills(job.skills_nice_to_have));
  }, [job]);

  // chip handlers
  const handleSkillKeyDown = (e, skills, setSkills) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (
        value &&
        !skills.map((s) => s.toLowerCase()).includes(value.toLowerCase())
      ) {
        setSkills([...skills, value]);
      }
      e.target.value = "";
    }
  };

  const handleRemoveSkill = (skill, skills, setSkills) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Render a single dynamic question → writes into formik.values[field]
  const renderQuestion = (q, idx) => {
    const field = q.field; // e.g., "work_mode", "max_experience", "location"
    const opts = Array.isArray(q.options) ? q.options : null;

    const getValue = () => formik.values[field] ?? "";
    const setValue = (val) =>
      formik.setFieldValue(
        field,
        field === "work_mode" ? normalizeWorkMode(val) : val
      );

    // Choose input type based on field
    const inputType = field?.toLowerCase()?.includes("experience")
      ? "number"
      : "text";

    return (
      <div key={`${field}-${idx}`} className="flex flex-col gap-1">
        <label className="text-slate-700 dark:text-slate-300 text-sm">
          {q.question || field}
        </label>

        {opts && opts.length > 0 ? (
          opts.length <= 4 ? (
            <div className="flex flex-wrap gap-3">
              {opts.map((opt) => {
                const value =
                  field === "work_mode" ? normalizeWorkMode(opt) : opt;
                return (
                  <label key={opt} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`missing_${field}`}
                      checked={getValue() === value}
                      onChange={() => setValue(value)}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <select
              value={getValue()}
              onChange={(e) => setValue(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select…</option>
              {opts.map((opt) => {
                const value =
                  field === "work_mode" ? normalizeWorkMode(opt) : opt;
                return (
                  <option key={opt} value={value}>
                    {opt}
                  </option>
                );
              })}
            </select>
          )
        ) : (
          <input
            type={inputType}
            value={getValue()}
            onChange={(e) => setValue(e.target.value)}
            className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-600 dark:text-slate-200"
            placeholder="Enter value"
          />
        )}

        {/* show validation message if this field is part of the schema */}
        {formik.touched[field] && formik.errors[field] && (
          <p className="mt-1 text-xs text-red-500">{formik.errors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col text-white my-6 w-full">
      <div className="relative z-10 w-full max-w-4xl">
        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
        >
          {/* Missing info block driven by AI questions */}
          {Array.isArray(questions) && questions.length > 0 && (
            <div className="md:col-span-2 mb-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-md p-3">
              <p className="text-xs mb-2 text-slate-500 dark:text-slate-400">
                We need a bit more info to complete this job:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map(renderQuestion)}
              </div>
            </div>
          )}

          {/* Job Title */}
          <div className="flex flex-col">
            <label
              htmlFor="job_title"
              className="mb-1 text-slate-700 dark:text-slate-300"
            >
              Job Title
            </label>
            <input
              id="job_title"
              name="job_title"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.job_title}
              className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-600 dark:text-slate-200"
              placeholder="e.g., Frontend Engineer"
            />
            {formik.touched.job_title && formik.errors.job_title && (
              <p className="mt-1 text-xs text-red-500">
                {formik.errors.job_title}
              </p>
            )}
          </div>

          {/* Minimum Experience */}
          <div className="flex flex-col">
            <label
              htmlFor="min_experience"
              className="mb-1 text-slate-700 dark:text-slate-300"
            >
              Minimum Experience (Years)
            </label>
            <input
              id="min_experience"
              name="min_experience"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.min_experience}
              className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-600 dark:text-slate-200"
              placeholder="e.g., 2"
            />
            {formik.touched.min_experience &&
              formik.errors.min_experience && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.min_experience}
                </p>
              )}
          </div>

          {/* Maximum Experience */}
          <div className="flex flex-col">
            <label
              htmlFor="max_experience"
              className="mb-1 text-slate-700 dark:text-slate-300"
            >
              Maximum Experience (Years)
            </label>
            <input
              id="max_experience"
              name="max_experience"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.max_experience}
              className="bg-transparent border border-slate-300 dark:border-slate-800 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-600 dark:text-slate-200"
              placeholder="e.g., 5"
            />
            {formik.touched.max_experience &&
              formik.errors.max_experience && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.max_experience}
                </p>
              )}
          </div>

          {/* Employment Type */}
          <div className="flex flex-col">
            <label
              htmlFor="employment_type"
              className="mb-1 text-slate-700 dark:text-slate-300"
            >
              Employment Type
            </label>
            <select
              id="employment_type"
              name="employment_type"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employment_type}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            {formik.touched.employment_type &&
              formik.errors.employment_type && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.employment_type}
                </p>
              )}
          </div>

          {/* Work Mode */}
          <div className="flex flex-col">
            <label
              htmlFor="work_mode"
              className="mb-1 text-slate-700 dark:text-slate-300"
            >
              Work Mode
            </label>
            <select
              id="work_mode"
              name="work_mode"
              onChange={(e) =>
                formik.setFieldValue(
                  "work_mode",
                  normalizeWorkMode(e.target.value)
                )
              }
              onBlur={formik.handleBlur}
              value={normalizeWorkMode(formik.values.work_mode)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-md p-2 h-9 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select Mode</option>
              <option value="online">online</option>
              <option value="hybrid">hybrid</option>
              <option value="offline">offline</option>
            </select>
            {formik.touched.work_mode && formik.errors.work_mode && (
              <p className="mt-1 text-xs text-red-500">
                {formik.errors.work_mode}
              </p>
            )}
          </div>

          {/* Skills (Must Have) */}
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-1 text-slate-700 dark:text-slate-300">
              Skills (Must Have)
            </label>
            <div className="flex flex-wrap items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md p-2 min-h-[40px]">
              {mustHaveSkills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="flex items-center gap-1 bg-slate-600 text-white text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                  <RiCloseLine
                    className="cursor-pointer text-white h-3 w-3"
                    onClick={() =>
                      handleRemoveSkill(
                        skill,
                        mustHaveSkills,
                        setMustHaveSkills
                      )
                    }
                  />
                </span>
              ))}
              <input
                type="text"
                onKeyDown={(e) =>
                  handleSkillKeyDown(e, mustHaveSkills, setMustHaveSkills)
                }
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-100"
                placeholder="Type a skill and press Enter or ,"
              />
            </div>
          </div>

          {/* Skills (Nice to Have) */}
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-1 text-slate-700 dark:text-slate-300">
              Skills (Nice to Have)
            </label>
            <div className="flex flex-wrap items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md p-2 min-h-[40px]">
              {niceToHaveSkills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="flex items-center gap-1 bg-slate-600 text-white text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                  <RiCloseLine
                    className="cursor-pointer text-white h-3 w-3"
                    onClick={() =>
                      handleRemoveSkill(
                        skill,
                        niceToHaveSkills,
                        setNiceToHaveSkills
                      )
                    }
                  />
                </span>
              ))}
              <input
                type="text"
                onKeyDown={(e) =>
                  handleSkillKeyDown(e, niceToHaveSkills, setNiceToHaveSkills)
                }
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-100"
                placeholder="Type a skill and press Enter or ,"
              />
            </div>
          </div>

          {/* Requirements (optional) */}
          <div className="md:col-span-2 flex flex-col">
            <label
              htmlFor="requirements"
              className="mb-1 text-slate-700 dark:text-slate-300"
            >
              Requirements
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows="4"
              style={{ resize: "none" }}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.requirements}
              className="text-slate-600 dark:text-slate-200 bg-transparent border border-slate-300 dark:border-slate-800 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="List key requirements for this role..."
            />
            {formik.touched.requirements && formik.errors.requirements && (
              <p className="mt-1 text-xs text-red-500">
                {formik.errors.requirements}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !formik.isValid}
              className="bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5]
                         text-white dark:text-black font-semibold px-6 py-2 rounded-full
                         text-sm transition-colors duration-300 disabled:opacity-70"
            >
              <span className="flex flex-row items-center gap-2">
                {loading ? "Please wait..." : "Continue"}
                <RiArrowRightLine className="h-5 w-5" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewJobForm;
