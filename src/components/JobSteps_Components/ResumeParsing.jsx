import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RiUploadCloud2Line,
  RiFilePdfLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiCloseLine,
  RiPlayLine,
} from "@remixicon/react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AiLoader from "./../Loaders/AiLoader";
import {uploadResumeRequest} from './../../store/slices/parseResumeSlice'

function bytesToSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let b = bytes;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(b < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// Rough page counter: scans PDF bytes for '/Type /Page' markers
async function estimatePdfPages(file) {
  try {
    const buf = await file.arrayBuffer();
    // PDF bytes are binary; latin1 decoding preserves bytes 0–255
    const text = new TextDecoder("latin1").decode(new Uint8Array(buf));
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return matches ? matches.length : 1;
  } catch {
    return undefined;
  }
}

export default function ResumeParsing({ onFilesChange, onConfirmParse }) {
  const dispatch = useDispatch();

  const location = useLocation();
  const { jobIdSidebar } = location.state || {};

  // Upload Resume State

  const { uploadResumeData, uploadResumeLoading, parseResumeData, parseResumeLoading } = useSelector(
   (state) =>  state.resumeParse
  );

  const [files, setFiles] = useState([]); // [{ id, file, url, pages? }]
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [estimatingIds, setEstimatingIds] = useState(new Set()); // ids being estimated

  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const makeId = (f) => `${f.name}-${f.size}-${f.lastModified}`;

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    const pdfs = incoming.filter((f) => f.type === "application/pdf");

    setFiles((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const toAdd = pdfs
        .filter((f) => !existing.has(makeId(f)))
        .map((f) => ({
          id: makeId(f),
          file: f,
          url: URL.createObjectURL(f),
          pages: undefined,
        }));
      return [...prev, ...toAdd];
    });

    // kick off async page estimates for new PDFs
    pdfs.forEach(async (f) => {
      const id = makeId(f);
      setEstimatingIds((s) => new Set([...s, id]));
      const pages = await estimatePdfPages(f);
      setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, pages } : p)));
      setEstimatingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    });
  }, []);

  const onSelectClick = () => inputRef.current?.click();

  const onInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt?.files?.length) addFiles(dt.files);
    dropRef.current?.classList.remove("ring-2", "ring-purple-500");
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.add("ring-2", "ring-purple-500");
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove("ring-2", "ring-purple-500");
  };

  const removeOne = (id) => {
    setFiles((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearAll = () => {
    setFiles((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  };

  const totalSize = useMemo(
    () => files.reduce((sum, f) => sum + (f.file?.size || 0), 0),
    [files]
  );

  useEffect(() => {
    return () => {
      files.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof onFilesChange === "function") {
      onFilesChange(files.map((f) => f.file));
    }
  }, [files, onFilesChange]);

  const openConfirm = () => setConfirmOpen(true);
  const closeConfirm = () => {
    setConfirmOpen(false);
  };

  // const handleConfirmParse = async () => {
  //   // plug your Redux/API action here
  //   if (typeof onConfirmParse === "function") {
  //         dispatch(uploadResumeRequest({job_id: jobIdSidebar,files: files}))

  //   } else {
  //     console.log(
  //       "Parsing resumes:",
  //       files.map((f) => ({ name: f.file.name, pages: f.pages }))
  //     );
  //   }

  //   // dispatch(uploadResumeRequest({job_id: jobIdSidebar,files: files}))

  //   setConfirmOpen(false);
  //   // dispatch(setActiveKey("rank"));
  // };

  const handleConfirmParse = () => {
    dispatch(uploadResumeRequest({ job_id: jobIdSidebar, files: files.map((x) => x.file), }))

    setConfirmOpen(false);
  }

  return (
    <div className="p-4 sm:p-6">
      {uploadResumeLoading || parseResumeLoading ? (
        <AiLoader />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Resume Parsing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload multiple PDF resumes. Preview, download, remove — then
                parse.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <>
                  <button
                    onClick={openConfirm}
                    className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black hover:shadow-lg hover:shadow-indigo-500/40"
                  >
                    <RiPlayLine className="h-4 w-4" />
                    Parse these resumes
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dropzone */}
          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="group relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 sm:p-8 bg-slate-50/60 dark:bg-slate-800/30 transition"
          >
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <RiUploadCloud2Line className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-200">
                Drag & drop your{" "}
                <span className="font-semibold">PDF resumes</span> here
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                or
              </div>
              <button
                type="button"
                onClick={onSelectClick}
                className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black hover:shadow-lg hover:shadow-indigo-500/40"
              >
                Select PDFs
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={onInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {files.length > 0 ? (
              <span>
                {files.length} file{files.length > 1 ? "s" : ""} •{" "}
                {bytesToSize(totalSize)}
              </span>
            ) : (
              <span>No files selected.</span>
            )}
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {files.map(({ id, file, url, pages }) => (
                <div
                  key={id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                      <RiFilePdfLine className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {bytesToSize(file.size)}
                        {typeof pages === "number" && (
                          <>
                            {" "}
                            • {pages} page{pages !== 1 ? "s" : ""}
                          </>
                        )}
                        {!pages && pages !== 0 && (
                          <> • {estimatingIds.has(id) ? "estimating…" : "—"}</>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setPreviewUrl(url)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <RiEyeLine className="h-4 w-4" />
                      View
                    </button>

                    <a
                      href={url}
                      download={file.name}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <RiDownloadLine className="h-4 w-4" />
                      Download
                    </a>

                    <button
                      onClick={() => removeOne(id)}
                      className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-900/20"
                    >
                      <RiDeleteBinLine className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview Modal */}
          {previewUrl && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewUrl(null)}
            >
              <div
                className="relative w-[92vw] h-[88vh] max-w-5xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  aria-label="Close"
                >
                  <RiCloseLine className="h-5 w-5" />
                </button>
                <iframe
                  title="PDF Preview"
                  src={previewUrl}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Confirm Parse Modal */}
          {confirmOpen && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={closeConfirm}
            >
              <div
                className="relative w-[92vw] max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold">Confirm Parsing</h3>
                  <button
                    onClick={closeConfirm}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RiCloseLine className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {files.length === 0 ? (
                    <p className="text-sm text-slate-500">No files to parse.</p>
                  ) : (
                    <ul className="space-y-3">
                      {files.map(({ id, file, pages, url }) => (
                        <li
                          key={id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {bytesToSize(file.size)} •{" "}
                              {typeof pages === "number"
                                ? `${pages} page${pages !== 1 ? "s" : ""}`
                                : "length estimating…"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setPreviewUrl(url)}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              View
                            </button>

                            <button
                              onClick={() => removeOne(id)}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-700/60 text-rose-600 dark:text-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-900/20"
                              aria-label={`Remove ${file.name}`}
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={closeConfirm}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmParse}
                    disabled={files.length === 0}
                    className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-gradient-to-b from-[#818cf8] via-[#6366f1] to-[#4f46e5] text-white dark:text-black hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-60"
                  >
                    <RiPlayLine className="h-4 w-4" />
                    Parse now
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
