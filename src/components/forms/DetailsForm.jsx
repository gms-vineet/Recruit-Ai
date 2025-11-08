import React, { useEffect } from "react";
import { useFormik } from "formik";
import { RiArrowRightLine } from "@remixicon/react";
import { useNavigate } from "react-router-dom";
import { createCompanyRequest } from "./../../store/slices/createCompanySlice";
import { useDispatch, useSelector } from "react-redux";

function DetailsForm() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const {loading, company} = useSelector((state) => state.companyCreate);

  useEffect(()=>{
    if(company){
    navigate('/dashboard')

    }
  },[company]);


  // --- Formik Setup ---
  const formik = useFormik({
    initialValues: {
      companyName: "",
      companyDescription: "",
      companyLocation: "",
      linkedInUrl: "",
    },
    onSubmit: (values, { setSubmitting }) => {
      // Read recruiter name from localStorage
      const recruiter_name = localStorage.getItem("rec_name") || "";
      const company_name = localStorage.getItem("company_name") || ""; // from form input
      const location = values.companyLocation;
      const linkedin_url = values.linkedInUrl;
      const description = values.companyDescription;

      // ✅ Build payload exactly matching your API schema
      const payload = {
        company_name,
        recruiter_name,
        location,
        linkedin_url,
        description,
      };
      localStorage.setItem('companyDetails', JSON.stringify(payload));

      // Dispatch saga action
      dispatch(createCompanyRequest(payload));

      // Optional redirect
      

      if(!loading) setSubmitting(false);
    },
  });

  const glassmorphismStyle = {
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    background: "rgba(6, 78, 59, 0.18)",
    borderRadius: "12px",
    border: "1px solid rgba(110, 231, 183, 0.2)",
    boxShadow:
      "0px 10px 30px 0 rgba(2, 44, 34, 0.25), inset 0 0 0px rgba(255, 255, 255, 0), inset 0px 0px 4px 2px rgba(255, 255, 255, 0.05)",
  };

  return (
    <div
      className="flex flex-col  text-white p-4 sm:p-8 w-full"
      //   style={glassmorphismStyle}
    >
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-full h-1/2" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-xl sm:text-4xl mx-4 font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
            Let’s get to know you better{" "}
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-100">
            {/* Please provide accurate company details to help us process your recruitment information efficiently. */}
            Tell us a bit about your company.
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Company Name */}
          {/* <div className="flex flex-col">
            <label
              htmlFor="companyName"
              className="mb-2 font-medium text-slate-700 dark:text-slate-300"
            >
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.companyName}
              className="bg-transparent border border-slate-400 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
              placeholder="e.g., NextGen Innovations"
            />
          </div> */}

          {/* Company Location */}
          <div className="flex flex-col md:col-span-2 ">
            <label
              htmlFor="companyLocation"
              className="mb-2 font-medium text-slate-700 dark:text-slate-300"
            >
              Company Location
            </label>
            <input
              id="companyLocation"
              name="companyLocation"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.companyLocation}
              className=" text-slate-700 dark:text-slate-300 bg-transparent border border-slate-400 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          {/* Company Description */}
          <div className="md:col-span-2 flex flex-col">
            <label
              htmlFor="companyDescription"
              className="mb-2 font-medium text-slate-700 dark:text-slate-300"
            >
              Company Short Description
            </label>
            <textarea
              id="companyDescription"
              name="companyDescription"
              rows="4"
              onChange={formik.handleChange}
              value={formik.values.companyDescription}
              className="bg-transparent border text-slate-700 dark:text-slate-300 border-slate-400 rounded-lg p-3 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow "
              placeholder="Tell us a bit about your company..."
            />
          </div>

          {/* LinkedIn URL */}
          <div className="md:col-span-2 flex flex-col">
            <label
              htmlFor="linkedInUrl"
              className="mb-2 font-medium text-slate-700 dark:text-slate-300"
            >
              LinkedIn URL
            </label>
            <input
              id="linkedInUrl"
              name="linkedInUrl"
              type="url"
              onChange={formik.handleChange}
              value={formik.values.linkedInUrl}
              className="bg-transparent border border-slate-400 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
              placeholder="https://www.linkedin.com/company/..."
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-b
from-[#818cf8]
via-[#6366f1]
to-[#4f46e5] 

 text-white dark:text-black font-bold px-8 py-3 rounded-full  hover:bg-cyan-300 transition-colors duration-300"
            >
              <p className="flex flex-row items-center gap-2">
                {" "}
                {loading ? "Please Wait..." : "Continue"}
                <RiArrowRightLine className="h-6 w-6 hover:text-yellow-400" />
              </p>
            </button>
          </div>
        </form>

        {/* <div className="mt-10 flex justify-center space-x-6 text-slate-500">
          <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><RiTwitterXFill size={24} /></a>
          <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><RiInstagramLine size={24} /></a>
          <a href="#" aria-label="Discord" className="hover:text-white transition-colors"><RiDiscordFill size={24} /></a>
        </div> */}
      </div>
    </div>
  );
}

export default DetailsForm;
