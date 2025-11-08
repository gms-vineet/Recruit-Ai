import React from "react";
import { RiArrowRightLine } from "@remixicon/react";
import { useFormik } from "formik";

function NameForm({ onContinue }) {
  const formik = useFormik({
    // Initial values for the form fields
    initialValues: {
      name: "",
      jobTitle: "",
    },
    // Submission handler
    onSubmit: (values) => {
      // For demonstration, we'll just alert the values.
      // In a real app, you would send this data to a server.
    //   alert(JSON.stringify(values, null, 2));
      // basic guard
      if (!values.name.trim()) return;

      // Call parent callback with name or full values
      onContinue?.(values.name.trim());

      localStorage.setItem('rec_name', values.name);
      localStorage.setItem('company_name', values.jobTitle);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="w-full mt-12 space-y-10">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-3xl font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            What is your name ?
          </label>
          <input
            id="name"
            name="name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.name}
            className="w-full text-xl p-4 border-b border-purple-500 dark:border-gray-400  rounded-lg bg-white/50 dark:bg-black/20 focus:border border-transparent focus:border-blue-500 focus:ring-0 outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-500"
            placeholder="e.g., John Doe"
          />
        </div>

        {/* Job Title Field */}
        <div>
          <label
            htmlFor="jobTitle"
            className="block text-xl font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            What is your Company Name ?
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.jobTitle}
            className="w-full text-xl p-4 border-b border-purple-500 dark:border-gray-400  rounded-lg bg-white/50 dark:bg-black/20 focus:border border-transparent focus:border-blue-500 focus:ring-0 outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-500"
            placeholder=""
          />
        </div>

        {/* Submit Button */}
        {/* <button
            type="submit"
            className="w-full text-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-4 transition-colors duration-300"
          >
            Continue
          </button> */}

        <button
          type="submit"
          className="bg-gradient-to-b
from-[#818cf8]
via-[#6366f1]
to-[#4f46e5] 

 text-white dark:text-black font-bold px-8 py-3 rounded-full mt-8 hover:bg-cyan-300 transition-colors duration-300"
        //   onClick={() => hanndleGetStarted()}
        >
          <p className="flex flex-row items-center gap-2">
            Continue{" "}
            <RiArrowRightLine className="h-6 w-6 hover:text-yellow-400" />
          </p>
        </button>
      </form>
    </div>
  );
}

export default NameForm;
