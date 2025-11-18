// // src/components/Modal/PreflightModal.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import mediaBus, { pipFromStream } from "@/lib/mediaBus";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import mediaBus, { pipFromStream } from "@/lib/mediaBus";
import { prepareInterview } from "@/store/slices/interviewSessionSlice";
export default function PreflightModal({
  open,
  defaultMeet = "",
  interviewerName = "Interviewer",
  candidateName = "Candidate",
  jdText = "",
  resumeText = "",
  onClose,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [meetUrl, setMeetUrl] = useState(defaultMeet);
  const [micReady, setMicReady] = useState(false);
  const [tabReady, setTabReady] = useState(false);
  const micStreamRef = useRef(null);
  const tabStreamRef = useRef(null);

  useEffect(() => {
    if (open) setMeetUrl(defaultMeet || "");
  }, [open, defaultMeet]);

  useEffect(() => {
    if (!open) {
      try { micStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
      try { tabStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
      micStreamRef.current = null;
      tabStreamRef.current = null;
      setMicReady(false);
      setTabReady(false);
    }
  }, [open]);

  async function pickMic() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      micStreamRef.current = s;
      setMicReady(true);
    } catch {
      alert("Microphone permission denied or unavailable.");
      setMicReady(false);
    }
  }

  async function openMeetAndCaptureTab() {
    let win = null;
    if (meetUrl && /^https?:\/\//i.test(meetUrl)) {
      win = window.open(meetUrl, "_blank", "noopener,noreferrer");
      mediaBus.setMeetWindow(win);
    }
    await new Promise(r => setTimeout(r, 300));
    let s;
    try {
      s = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser", preferCurrentTab: false },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: true
        },
      });
    } catch {
      alert("Tab capture cancelled/failed. Pick the Meet TAB and enable 'Share tab audio'.");
      setTabReady(false);
      return;
    }
    if (!s.getAudioTracks().length) {
      alert('No audio captured from the tab. Re-try and enable "Share tab audio".');
    }
    try { await pipFromStream(s); } catch {}
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

    navigate("/interview-room", {
      state: {
        autostart: { mic: !!micStreamRef.current, tab: !!tabStreamRef.current },
        // interviewer: interviewerName,
        // candidate: candidateName,
        // jd: jdText,
        // resume: resumeText,
        // meetUrl: meetUrl || "",
        // sessionId: "",
        promptMic: false,
      },
    });
    onClose?.();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="w-[680px] rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 text-lg font-semibold">Interview preflight</div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
              Meeting link (optional)
            </label>
            <input
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={pickMic}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              {micReady ? "Mic ✓" : "Pick Microphone"}
            </button>

            <button
              type="button"
              onClick={openMeetAndCaptureTab}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              title="Opens Meet (if provided), then asks you to share that tab with audio, and starts PiP"
            >
              {tabReady ? "Meet Tab (PiP) ✓" : "Open Meet + Capture & PiP"}
            </button>

            <div className="ml-auto" />

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!micReady && !tabReady}
              onClick={startInterview}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start Interview
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tip: In the tab picker, choose the Meet <b>tab</b> and enable “Share tab audio”.
          </div>
        </div>
      </div>
    </div>
  );
}