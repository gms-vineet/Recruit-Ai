// src/components/Modal/PreflightModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import mediaBus, { pipFromStream } from "@/lib/mediaBus";
import {
  prepareInterview,
  bootstrapSessionRequest, // ✅ NEW: import bootstrap action
} from "@/store/slices/interviewSessionSlice";
import SparkleButton from "../../components/buttons/SparkleButton"; // adjust if your path is different

export default function PreflightModal({
  open,
  interviewId,          // ✅ NEW: get interviewId from parent
  defaultMeet = "",
  interviewerName = "Interviewer",
  candidateName = "Candidate",
  jdText = "",
  resumeText = "",
  onClose,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [meetUrl, setMeetUrl] = useState(defaultMeet || "");
  const [micReady, setMicReady] = useState(false);
  const [tabReady, setTabReady] = useState(false);
  const micStreamRef = useRef(null);
  const tabStreamRef = useRef(null);

  // ✅ 1) reset Meet URL whenever modal opens
  useEffect(() => {
    if (open) {
      setMeetUrl(defaultMeet || "");
    }
  }, [open, defaultMeet]);

  // ✅ 2) STOP streams when modal closes
  useEffect(() => {
    if (!open) {
      try {
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        tabStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      micStreamRef.current = null;
      tabStreamRef.current = null;
      setMicReady(false);
      setTabReady(false);
    }
  }, [open]);

  // ✅ 3) BOOTSTRAP session when modal opens with an interviewId
  useEffect(() => {
    if (open && interviewId) {
      dispatch(bootstrapSessionRequest({ interviewId }));
    }
  }, [open, interviewId, dispatch]); // 🔴 THIS is the snippet you asked about

  async function pickMic() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      micStreamRef.current = s;

      s.getTracks().forEach((track) => {
        track.onended = () => {
          setMicReady(false);
          micStreamRef.current = null;
        };
      });

      setMicReady(true);
    } catch {
      alert("Microphone permission denied or unavailable.");
      setMicReady(false);
    }
  }

  async function openMeetAndCaptureTab() {
    if (!meetUrl || !/^https?:\/\//i.test(meetUrl)) {
      alert("No meeting link is configured for this interview.");
      return;
    }

    let win = null;
    try {
      win = window.open(meetUrl, "_blank", "noopener,noreferrer");
      mediaBus.setMeetWindow(win);
    } catch {
      // popup might be blocked; still try capture
    }

    await new Promise((r) => setTimeout(r, 300));

    let s;
    try {
      s = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser", preferCurrentTab: false },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: true,
        },
      });
    } catch {
      alert(
        "Tab capture cancelled/failed. Pick the Meet TAB and enable 'Share tab audio'."
      );
      setTabReady(false);
      return;
    }

    if (!s.getAudioTracks().length) {
      alert('No audio captured from the tab. Re-try and enable "Share tab audio".');
    }

    s.getTracks().forEach((track) => {
      track.onended = () => {
        setTabReady(false);
        tabStreamRef.current = null;
      };
    });

    try {
      await pipFromStream(s);
    } catch {}

    tabStreamRef.current = s;
    setTabReady(true);
    mediaBus.setTabStream(s);
  }

  function startInterview() {
    if (micStreamRef.current) mediaBus.setMicStream(micStreamRef.current);

    dispatch(
      prepareInterview({
        interviewerName,
        candidateName,
        jd: jdText,
        resume: resumeText,
        meetUrl: meetUrl || "",
      })
    );

    // ✅ use interviewId prop, not row.interview_id
    // navigate("/interview-room", {
    //   state: {
    //     interviewId: interviewId || null,
    //     autostart: {
    //       mic: !!micStreamRef.current,
    //       tab: !!tabStreamRef.current,
    //     },
    //     promptMic: false,
    //   },
    // });
    navigate("/interview-room", {
      state: {
        interviewId: interviewId || null,
        candidateName,
        interviewerName,
        jdText,
        resumeText,
        autostart: {
          mic: !!micStreamRef.current,
          tab: !!tabStreamRef.current,
        },
        promptMic: false,
     },
    });

    onClose?.();
  }

  if (!open) return null;

  const step1Done = !!meetUrl;
  const step2Done = tabReady;
  const step3Done = micReady;

  const steps = [
    { id: "s1", label: "Meeting tab", done: step1Done },
    { id: "s2", label: "Interviewer audio", done: step2Done },
    { id: "s3", label: "Your mic", done: step3Done },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const allStepsDone = steps.every((s) => s.done);

  return (
     <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/30 dark:bg-slate-950/70 backdrop-blur-sm">
      <div
        className="
          w-[560px] max-w-[95vw] rounded-2xl shadow-2xl
          border border-slate-200/80 bg-white/95 text-slate-900
          dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100
        "
      >
        {/* header */}
       <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-900/70">
          <div>
           <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Get ready with Interview Copilot
            </h2>
           <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              We&apos;ll listen to the meeting audio and your mic to generate
              live notes and an interview summary for{" "}
             <span className="font-medium text-slate-900 dark:text-slate-100">
                {candidateName}
              </span>
              .
            </p>
          </div>

         <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* stepper */}
        <div className="px-6 pt-3 pb-2">
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wide text-[10px] text-slate-500 dark:text-slate-400">
              Setup checklist
            </span>
            <span>{completedCount}/3 steps completed</span>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-1">
                  <div
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-semibold",
                      step.done
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                        : "border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-600",
                    ].join(" ")}
                  >
                    {step.done ? "✓" : ""}
                  </div>
                  <span className="hidden text-[11px] text-slate-600 dark:text-slate-300 sm:inline">
                    {step.label}
                  </span>
                </div>
                 {idx < steps.length - 1 && (
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/80" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* body */}
        <div className="px-6 pb-4 pt-3 text-xs">
          <ol className="space-y-4">
            {/* Step 1 */}
            <li className="flex gap-3">
              <div />
              <div className="space-y-1">
               <p className="font-medium text-slate-900 dark:text-slate-100">
                  Open your meeting tab.
                </p>
              <p className="text-slate-600 dark:text-slate-400">
                  If a meeting link is configured, we&apos;ll open it for you in
                  a new tab when you share the interviewer&apos;s audio.
                </p>
                {!meetUrl && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No Meet link is set for this interview. The interviewer
                    should join their call manually before sharing audio.
                  </p>
                )}
              </div>
            </li>

            {/* Step 2 */}
            <li className="flex gap-3">
              <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                {step2Done ? "✓" : ""}
              </div>
              <div className="space-y-1">
                 <p className="font-medium text-slate-900 dark:text-slate-100">
                  Share the interviewer&apos;s audio.
                </p>
                 <p className="text-slate-600 dark:text-slate-400">
                  Click the button below, pick the meeting <b>tab</b>, and make
                  sure &quot;Share tab audio&quot; is enabled so the copilot
                  can hear the conversation.
                </p>
                 <button
                  type="button"
                  onClick={openMeetAndCaptureTab}
                  className="
                    mt-2 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors
                    border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200
                    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  {tabReady
                    ? "Interviewer audio shared ✓"
                    : "Share interviewer’s audio"}
                </button>
              </div>
            </li>

            {/* Step 3 */}
             <li className="flex gap-3">
              <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                {step3Done ? "✓" : ""}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Share your microphone.
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Turn on your mic so the copilot can also capture your
                  comments and follow-up questions.
                </p>
                <button
                  type="button"
                  onClick={pickMic}
                  className="
                    mt-2 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors
                    border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200
                    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  {micReady ? "Your mic is on ✓" : "Share your audio"}
                </button>
              </div>
            </li>   
          </ol>
        </div>

        {/* footer CTA */}
         <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400"></p>
          <SparkleButton onClick={startInterview} disabled={!allStepsDone}>
            Start Interview
          </SparkleButton>
        </div>
      </div>
    </div>
  );
}
