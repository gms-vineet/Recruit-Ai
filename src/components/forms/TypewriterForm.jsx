import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Typewriter from "typewriter-effect";
import {
  saveJDRequest,
  updateJDRequest,
  regenerateJDRequest,
} from "./../../store/slices/createJobSlice";
import {
  RiRefreshLine,
  RiSave3Line,
  RiPencilLine,
  RiFileCopyLine,
  RiCloseLine,
} from "@remixicon/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import JDLoader from "./../Loaders/JDLoader";
import { toast } from "react-hot-toast";

function TypewriterForm({ JDfromSidebar, jobIDSidebar }) {
  const dispatch = useDispatch();
  const { job, saving, updating } = useSelector((state) => state.createJob);

  // UI SLICE - create jd
  const { quesLoading, loading } = useSelector((state) => state.createJD);

  const uploadJdData = useSelector((state) => state.uploadJD.data);

  const [generatedText, setGeneratedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenrating, setGenrating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [plainText, setPlainText] = useState("");
  const [finalSave, setFinalSave] = useState(false);
  const [hasTyped, setHasTyped] = useState(false); // animate once

  const typewriterRef = useRef(null);

  // unified, always-latest text for display
  const sourceText = useMemo(() => {
    return (
      (generatedText && generatedText.trim()) ||
      (job?.jd_text && job.jd_text.trim()) ||
      (uploadJdData?.job?.jd_text && uploadJdData.job.jd_text.trim()) || // ✅ new case
      (uploadJdData?.parsed?.jd_text && uploadJdData.parsed.jd_text.trim()) ||
      (JDfromSidebar && JDfromSidebar.trim()) ||
      ""
    );
  }, [
    generatedText,
    job?.jd_text,
    uploadJdData?.job?.jd_text, // ✅ add to deps
    uploadJdData?.parsed?.jd_text, // existing dep
    JDfromSidebar,
  ]);

  // warn before unload while editing/saving
  useEffect(() => {
    const active = isEditing || saving || updating || quesLoading || loading;
    const beforeUnload = (e) => {
      if (!active) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isEditing, saving, updating, quesLoading, loading]);

  // hydrate when JDfromSidebar / job changes (don’t clobber while editing)
  useEffect(() => {
    if (JDfromSidebar && !isEditing) {
      setGeneratedText(JDfromSidebar);
      const html = JDfromSidebar.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      ).replace(/\n/g, "<br />");
      setEditorValue(html);
      setPlainText(JDfromSidebar);
      setHasTyped(true); // show instantly for sidebar content
    }
    if (job?.jd_text && !isEditing) {
      setGeneratedText(job.jd_text);
      const html = job.jd_text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
      setEditorValue(html);
      setPlainText(job.jd_text);
    }
  }, [JDfromSidebar, job?.jd_text, isEditing]);

  // when upload parsed text arrives, hydrate local state too
  useEffect(() => {
    const text = uploadJdData?.parsed?.jd_text || "";
    if (text && !isEditing) {
      setGeneratedText(text);
      const html = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
      setEditorValue(html);
      setPlainText(text);
      // allow animation if not from sidebar
      // do NOT set hasTyped here so it can animate the first time
    }
  }, [uploadJdData, isEditing]);

  // if a JD came from sidebar, force view mode and show actions
  useEffect(() => {
    if (JDfromSidebar) {
      setIsEditing(false);
      setGenrating(false);
      setShowEdit(true);
    }
  }, [JDfromSidebar]);

  const handleRegenerate = () => {
    const id = job?.job_id || jobIDSidebar;
    dispatch(regenerateJDRequest(id));
  };

  const handleSave = () => {
    const id = job?.job_id || jobIDSidebar;

    if (isEditing) {
      // prefer plain text actually edited by the user
      const nextText = plainText?.trim()
        ? plainText
        : (editorValue || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
            .replace(/<[^>]+>/g, "");

      setGeneratedText(nextText);
      setEditorValue(
        nextText
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br />")
      );
      setIsEditing(false);

      dispatch(updateJDRequest({ id, patch: nextText }));
    }

    dispatch(saveJDRequest(id));
    setFinalSave(true);
    toast.success("Job Successfully Saved!");
    localStorage.removeItem("isCreateJob");
  };

  const handleEdit = () => setIsEditing(true);

  const handleCopy = () => {
    const textToCopy =
      (plainText && plainText.trim()) ||
      (sourceText && sourceText.trim()) ||
      "No job description to copy.";

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      toast.success("Job description copied to clipboard !");
    } else {
      const el = document.createElement("textarea");
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  return (
    <div className="relative flex flex-col p-4 sm:p-8 w-full">
      {(saving || updating) && <JDLoader />}

      <div
        className={
          saving || updating ? "hidden pointer-events-none opacity-60" : ""
        }
      >
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Header */}
          {!JDfromSidebar && (
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-4xl mx-4 font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                Here’s what we’ve crafted for you
              </h1>
              <p className="mt-4 text-slate-600 dark:text-slate-100">
                Review or edit your AI-generated Job Description.
              </p>
            </div>
          )}

          {JDfromSidebar && (
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-4xl mx-4 font-bold bg-gradient-to-l from-purple-400 via-purple-600 to-purple-500 dark:from-slate-400 dark:via-violet-500 dark:to-zinc-400 bg-clip-text text-transparent">
                Here’s the job description I just generated for you
              </h1>
              <p className="mt-4 text-slate-600 dark:text-slate-100">
                share your AI-generated Job Description.
              </p>
            </div>
          )}

          {/* actions */}
          {!uploadJdData && (
            <div className="flex flex-wrap justify-end gap-4 py-4">
              {!isGenrating && !JDfromSidebar && !finalSave && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5]
               text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300
               hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:scale-105"
                >
                  <RiRefreshLine /> Regenerate
                </button>
              )}

              {/* allow editing also when opened from sidebar */}
              {!isGenrating && !JDfromSidebar && !finalSave && (
                <button
                  onClick={handleEdit}
                  className={`text-slate-9 00 dark:text-white flex items-center gap-2 bg-transparent  px-6 py-2 rounded-md  transition-all ${
                    isEditing
                      ? "border-purple-500 border-2 text-purple-500"
                      : "border border-slate-400"
                  }`}
                >
                  {isEditing ? (
                    <RiCloseLine className="h-5 w-5" />
                  ) : (
                    <RiPencilLine className="h-5 w-5" />
                  )}
                  {isEditing ? "Close Editing" : "Edit"}
                </button>
              )}

              {!isGenrating && !JDfromSidebar && !finalSave && (
                <button
                  onClick={handleSave}
                  className="text-slate-900 dark:text-white flex items-center gap-2 bg-transparent border border-slate-400 px-6 py-2 rounded-md  transition-all "
                >
                  <RiSave3Line className="h-5 w-5" /> Save
                </button>
              )}

              {(JDfromSidebar || finalSave) && (
                <button
                  onClick={handleCopy}
                  className="text-slate-900 dark:text-white flex items-center gap-2 bg-transparent px-6 py-2 rounded-md transition-all border border-slate-400 hover:border-purple-500 hover:text-purple-500"
                >
                  <RiFileCopyLine className="h-5 w-5" />
                  Copy to Clipboard
                </button>
              )}
            </div>
          )}

          {/* Typewriter / Editor */}
          <div
            className="p-6 mb-4 border border-purple-200 dark:border-purple-600 rounded-md
               [&_.Typewriter__wrapper]:whitespace-pre-wrap
               [&_.Typewriter__wrapper]:break-words"
          >
            {!isEditing ? (
              // If we already typed once (e.g., from sidebar), or there’s no text yet → instant render
              hasTyped || JDfromSidebar ? (
                <div
                  className="min-h-[150px] font-mono text-slate-800 dark:text-slate-100 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: (sourceText || "")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br />"),
                  }}
                />
              ) : (
                // Animate once when we first get text. Force remount with key.
                <div className="min-h-[150px] font-mono text-slate-800 dark:text-slate-100 leading-relaxed">
                  {sourceText ? (
                    // <Typewriter
                    //   key={sourceText} // 🔑 force remount when text changes
                    //   onInit={(tw) => {
                    //     typewriterRef.current = tw;
                    //     const html = sourceText
                    //       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    //       .replace(/\n/g, "<br />");

                    //     setEditorValue((prev) => (prev ? prev : html));
                    //     setGenrating(true);

                    //     tw.typeString(html)
                    //       .callFunction(() => {
                    //         setShowEdit(true);
                    //         setGenrating(false);
                    //         setHasTyped(true);
                    //       })
                    //       .start();

                    //     setGeneratedText(sourceText);
                    //   }}
                    //   options={{
                    //     delay: 0,
                    //     cursor: "",
                    //     wrapperClassName: "whitespace-pre-wrap break-words",
                    //   }}
                    // />

                    <div
                      className="whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: sourceText
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br />"),
                      }}
                    />
                  ) : (
                    // nothing to type yet
                    <div className="min-h-[150px]" />
                  )}
                </div>
              )
            ) : (
              // Editor view (ReactQuill)
              <div
                className="bg-transparent text-slate-700 dark:bg-slate-900 dark:text-slate-100
      [&_.ql-toolbar]:border-slate-300
      dark:[&_.ql-toolbar]:border-slate-700
      [&_.ql-container]:bg-transparent
      [&_.ql-editor]:text-slate-700
      dark:[&_.ql-editor]:text-slate-100
      [&_.ql-editor]:min-h-[200px]"
              >
                <ReactQuill
                  theme="snow"
                  value={editorValue}
                  onChange={(content, delta, source, editor) => {
                    setEditorValue(content);
                    setPlainText(editor.getText());
                  }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "list",
                    "bullet",
                    "link",
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypewriterForm;
