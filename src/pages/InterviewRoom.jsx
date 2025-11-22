// src/pages/InterviewRoom.jsx
// import React, { useEffect, useRef } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import mediaBus, { stopPiP } from "@/lib/mediaBus";
import RightSidePanel from "../components/Modal/RightSidePanel";
import {
  setInterviewSessionId,
  setInterviewStatus,
  setInterviewError,
  endInterviewSession,
  setValidationData,
  setAISuggestions,
  setSummary,
  hydrateBootstrapMeta,
  fetchTurnsRequest,
  fetchQuestionsRequest,
  fetchSummaryRequest,
} from "@/store/slices/interviewSessionSlice";

const MAX_SECONDS = 60 * 60; 
const styles = `

.ir-wrap {
  color: #e5e7eb;
  font: 15px/1.45 system-ui, sans-serif;
}

/* LIGHT THEME – make text dark & readable */
:root:not(.dark) .ir-wrap {
  color: #0f172a;
}

:root:not(.dark) .ir-bubble {
  background: #eff6ff;          /* light chat bubble */
  border-color: #c7d2fe;
  color: #111827;
}

/* header */
.ir-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.9);
  display: flex;
  gap: 12px;
  align-items: center;
  background: transparent;
}
.ir-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}

/* main layout */
.ir-main {
  width: 100%;
  max-width: none;
  margin: 18px 0;
  padding: 0 16px 32px;
}
.ir-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}
@media (max-width:1280px){ .ir-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width:860px) { .ir-grid { grid-template-columns: minmax(0, 1fr); } }
.ir-stack { display:flex; flex-direction:column; gap:8px; }

/* buttons */
.ir-btn {
  padding: 10px 14px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.ir-btn.secondary {
  background:#374151;            /* same for Candidate Audio, Validate, AI Questions */
  color:#f9fafb;
}
  .ir-btn.secondary:hover {
  background:#111827;
}
.ir-btn.danger { background:#7f1d1d; }

/* compact button for pill header */
.ir-btn.compact {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 999px;
}

/* icon buttons */
.ir-btn.icon{
  display:flex;
  align-items:center;
  gap:8px;
  position:relative;
}
.ir-btn .split{display:inline-flex;align-items:center;gap:6px;}
.ir-btn .split .body{display:inline-flex;align-items:center;gap:8px;}
.ir-btn .split .caret{
  padding-left:6px;
  border-left:1px solid rgba(255,255,255,.15);
  margin-left:6px;
}

.ir-icon{display:inline-flex;line-height:0}
.ir-icon.mic{color:#ef4444}
.ir-icon.monitor{color:#22c55e}
/* mic on/off toggle icon for defaultMicToggle */
.micbtn .icon-mic-on {
  display: none;              /* hidden when mic is OFF */
}

.micbtn .icon-mic-off {
  display: inline-flex;       /* visible when mic is OFF */
  color: #9ca3af;             /* grey "muted" color */
}

/* when mic is ON (data-active="1" set by setMicUI) */
.micbtn[data-active="1"] .icon-mic-on {
  display: inline-flex;
}

.micbtn[data-active="1"] .icon-mic-off {
  display: none;
}

.ir-btn[data-active="1"]{outline:1px solid #22c55e;background:#102a19}
.ir-btn.micbtn[data-active="1"]{outline-color:#ef4444;background:#2a0f14}

/* pills – dark vs light */
.ir-pill {
  background:#111827;      /* dark */
  color:#e5e7eb;
  border-radius:999px;
  padding:6px 10px;
  font-size:13px;
}
:root:not(.dark) .ir-pill {
  background:#e5effe;      /* light indigo */
  color:#1f2937;
}

/* light mode candidate bubble */
:root:not(.dark) .ir-chat-bubble.candidate {
  background: #eef2ff;        /* light indigo */
  border-color: #c7d2fe;
  color: #0f172a;
}

/* light mode mic menu dropdown */
:root:not(.dark) .ir-menu {
  background: #ffffff;
  border-color: #e5e7eb;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}
:root:not(.dark) .ir-menu .item {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #0f172a;
}
:root:not(.dark) .ir-menu .item:hover {
  background: #e5effe;
}

/* panels */
.ir-panel {
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid #1f2937;
  border-radius: 14px;
  padding: 14px;
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  display:flex;
  flex-direction:column;
  min-height: 520px;
  max-height: calc(100vh - 190px); /* fixed-ish height, rest scrolls */
}
:root:not(.dark) .ir-panel {
  background: rgba(249, 250, 251, 0.9);      /* slate-50-ish */
  border-color: #e5e7eb;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18);
}

/* scrollable area inside each panel */
.ir-panel-body {
  flex:1;
  overflow:auto;
  margin-top:8px;
}

/* header inside panel (pill + small button) */
.ir-panel-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  margin-bottom:8px;
}
  .ir-sug-list {
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:8px;
}

/* single suggestion row */
.ir-sug-item {
  display:flex;
  align-items:flex-start;
  gap:8px;
  font-size:14px;
}

/* left number chip */
.ir-sug-num {
  flex-shrink:0;
  min-width:26px;
  height:26px;
  border-radius:999px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:600;
  background:#1d4ed8;
  color:#e5e7eb;
}

/* light mode number chip */
:root:not(.dark) .ir-sug-num {
  background:#4f46e5;
  color:#eef2ff;
}

/* right text */
.ir-sug-text {
  flex:1;
}
.ir-sug-q {
  font-weight: 600;
  margin-bottom: 3px;
}

.ir-sug-a {
  font-size: 13px;
  color: #9ca3af;
}

:root:not(.dark) .ir-sug-a {
  color: #4b5563;
}
/* transcript / text */
.ir-interim {
  color:#cbd5e1;
  font-style:italic;
  opacity:.9;
  min-height:22px;
}

/* conversational transcript */
.ir-chatlog{
  max-height:none;
  overflow:auto;
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:4px 0;
}
.ir-chat-row{
  width:100%;
  display:flex;
}
.ir-chat-row.from-interviewer{
  justify-content:flex-end;
}
.ir-chat-row.from-candidate{
  justify-content:flex-start;
}
.ir-chat-bubble{
  max-width:78%;
  padding:10px 14px;
  border-radius:18px;
  font-size:14px;
  line-height:1.4;
  display:flex;
  gap:8px;
  align-items:flex-end;

  /* glass core */
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
}

.ir-chat-bubble.interviewer{
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.24),
    rgba(79, 70, 229, 0.38)
  );
  color:#f9fafb;
  border:1px solid rgba(129,140,248,0.75);
  box-shadow:0 14px 30px rgba(15, 23, 42, 0.7);
  border-bottom-right-radius:6px;
  border-bottom-left-radius:18px;
}


.ir-chat-bubble.candidate{
  background: rgba(15, 23, 42, 0.75);
  color:#e5e7eb;
  border:1px solid rgba(148,163,184,0.55);
  box-shadow:0 12px 30px rgba(15, 23, 42, 0.7);
  border-bottom-left-radius:6px;
  border-bottom-right-radius:18px;
}
:root:not(.dark) .ir-chat-bubble.interviewer{
  background: linear-gradient(
    135deg,
    rgba(224, 231, 255, 1),
    rgba(221, 214, 254, 1)
  );
  color:#111827;
  border-color: rgba(129,140,248,0.85);
}


:root:not(.dark) .ir-chat-bubble.candidate{
  background: rgba(243,244,246,0.9);
  color:#111827;
  border-color: rgba(209,213,219,0.9);
}
.ir-chat-text{flex:1;}
.ir-chat-who{
  display:block;
  font-size:12px;
  font-weight:600;
  opacity:0.9;
  margin-bottom:2px;
}

/* "Send" button inside interviewer bubble */
.ir-sendbtn{
  background:#0b1220;
  border:1px solid #334155;
  color:#d1d5db;
  border-radius:8px;
  padding:4px 8px;
  cursor:pointer;
  font-size:12px;
  margin-left:6px;
}
.ir-sendbtn:hover{background:#1e293b}

/* tiny text */
.ir-tiny{font-size:12px;color:#9aa3ac}
.ir-list{
  margin: 0;
  padding-left: 1.1rem;
  display:flex;
  flex-direction:column;
  gap:4px;
  font-size:14px;
}

/* right column */
.ir-rightbox { 
  position:relative;
}

/* summary pre */
.ir-pre{white-space:pre-wrap;}

/* verdict badge */
.ir-badge{padding:2px 6px;border-radius:6px;font-size:12px;}
.ir-ok{background:#064e3b;color:#a7f3d0;}
.ir-warn{background:#4f46e5;color:#e0e7ff;}
.ir-bad{background:#7f1d1d;color:#fecaca;}

/* dropdown */
.ir-menu{
  position:absolute;
  top:100%;
  left:0;
  margin-top:8px;
  min-width:280px;
  background:#0b1220;
  border:1px solid #1f2937;
  border-radius:12px;
  padding:8px;
  box-shadow:0 10px 30px rgba(0,0,0,0.35);
  z-index:1000;
  display:none;
}
.ir-menu[data-open="1"]{display:block;}
.ir-menu h4{
  margin:4px 6px 8px;
  font-size:12px;
  color:#9aa3ac;
  font-weight:600;
  letter-spacing:.04em;
}
.ir-menu .item{
  width:100%;
  text-align:left;
  background:#0f172a;
  border:1px solid #1f2937;
  color:#cbd5e1;
  padding:8px 10px;
  border-radius:10px;
  cursor:pointer;
  margin:4px 0;
}
.ir-menu .item:hover{background:#142036;}
.ir-menu .item[data-active="1"]{outline:1px solid #2563eb;background:#13233f;}
.ir-menu .line{height:1px;background:#1f2937;margin:8px 2px;}


.ir-timer-stack {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ir-timer-shell {
  position: relative;
  width: 44px;
  height: 44px;
}

.ir-timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* start at top */
}

.ir-timer-track {
  fill: none;
  stroke: rgba(148, 163, 184, 0.45);
  stroke-width: 4;
}

.ir-timer-progress {
  fill: none;
  stroke: #22c55e;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.25s ease;
}

.ir-timer-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

/* light mode */
:root:not(.dark) .ir-timer-track {
  stroke: rgba(148, 163, 184, 0.55);
}
:root:not(.dark) .ir-timer-progress {
  stroke: #16a34a;
}
/* hide status chip completely */
#status{display:none;}
`;
const IconMicOff = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
    {/* same mic shape */}
    <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z" />
    <path d="M5 11a1 1 0 1 0-2 0 9 9 0 0 0 8 8v3h2v-3a9 9 0 0 0 8-8 1 1 0 1 0-2 0 7 7 0 0 1-14 0z" />
    {/* slash */}
    <path d="M5 4.5 4 5.5l15 15 1-1-15-15z" />
  </svg>
);

export default function InterviewRoom() {
  const { state } = useLocation() || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const interviewSession = useSelector((s) => s.interviewSession);

  const [showResumePanel, setShowResumePanel] = useState(false);
    // ⏱ TIMER STATE
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerStartRef = useRef(Date.now());
useEffect(() => {
    const status = interviewSession?.status;
    const hasContext =
      !!(state?.interviewId || interviewSession?.interviewId);

    // 1) Interview already finished → bounce to report
    if (status === "ended") {
      navigate("/interview/report", { replace: true });
      return;
    }

    // 2) Direct URL /interview-room with no context → block
    if (!hasContext) {
      navigate("/dashboard", { replace: true });
    }
  }, [
    interviewSession?.status,
    interviewSession?.interviewId,
    state?.interviewId,
    navigate,
  ]);
 // start ticking when the room mounts
  useEffect(() => {
    timerStartRef.current = Date.now();

    const id = setInterval(() => {
      const diff =
        (Date.now() - timerStartRef.current) / 1000; // ms → seconds
      setElapsedSec(Math.max(0, Math.floor(diff)));
    }, 1000);

    return () => clearInterval(id);
  }, []);

    const safeSeconds = Math.min(elapsedSec, MAX_SECONDS);
  const progress = safeSeconds / MAX_SECONDS;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const timerLabel = (() => {
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  })();
  // candidate name + resume text from store or route state
  const candidateName =
    interviewSession?.candidateName ||
    state?.candidateName ||
    state?.candidate ||
    "Candidate";

  const resumeText =
    interviewSession?.resume ||
    state?.resumeText ||
    state?.resume ||
    "";
  useEffect(() => {
    if (!interviewSession?.sessionId) return;

    dispatch(fetchTurnsRequest());
    dispatch(fetchQuestionsRequest({ count: 5 }));
  }, [interviewSession?.sessionId, dispatch]);

  const sessionInitRef = useRef(null);

  const metaRef = useRef({
    sessionId: interviewSession?.sessionId || state?.sessionId || "",
    interviewer:
      // interviewSession?.interviewerName ||
      // state?.interviewer ||
      // "Interviewer",
       interviewSession?.interviewerName ||
      state?.interviewerName ||
      state?.interviewer ||
      "Interviewer",
    candidate:
    //   interviewSession?.candidateName || state?.candidate || "Candidate",
    // jd: interviewSession?.jd || state?.jd || "",
    // resume: interviewSession?.resume || state?.resume || "",
     interviewSession?.candidateName ||
      state?.candidateName ||
      state?.candidate ||
      "Candidate",
       jd:
      interviewSession?.jd ||
      state?.jdText ||
      state?.jd ||
      "",
      resume:
      interviewSession?.resume ||
      state?.resumeText ||
      state?.resume ||
      "",
    meetUrl: interviewSession?.meetUrl || state?.meetUrl || "",
  });

  useEffect(() => {
    document.body.classList.add("interview-room-body");

    const BACKEND_HTTP =
      (import.meta?.env?.VITE_BACKEND_HTTP?.replace(/\/$/, "")) ||
      "https://recruit-ai-9bqm.onrender.com";

    const httpURL = new URL(BACKEND_HTTP);
    const BACKEND_WS =
      (httpURL.protocol === "https:" ? "wss://" : "ws://") + httpURL.host;

    const REQUEST_TIMEOUT_MS = 10000;

    const fetchWithTimeout = (url, options = {}, ms = REQUEST_TIMEOUT_MS) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), ms);
      return fetch(url, { ...options, signal: controller.signal }).finally(() =>
        clearTimeout(id)
      );
    };

    let selectedMicId = null;
    let selectedMicLabel = "System Default";
    let audioInputs = [];
    let micOn = false;

    let meetMuted = null;
    try {
      const bc = new BroadcastChannel("meet-mute");
      bc.onmessage = (ev) => {
        if (typeof ev.data?.muted === "boolean") meetMuted = ev.data.muted;
      };
    } catch {}

    const VAD_THRESH = 0.0025;
    function rms(frame) {
      let s = 0;
      for (let i = 0; i < frame.length; i++) s += frame[i] * frame[i];
      return Math.sqrt(s / frame.length);
    }

    function downsampleFloat32ToInt16(float32, inRate, outRate = 16000) {
      const ratio = inRate / outRate;
      const newLen = Math.floor(float32.length / ratio);
      const out = new Int16Array(newLen);
      let o = 0,
        i = 0;
      while (o < newLen) {
        const next = Math.round((o + 1) * ratio);
        let acc = 0,
          cnt = 0;
        while (i < next && i < float32.length) {
          acc += float32[i++];
          cnt++;
        }
        const sample = Math.max(-1, Math.min(1, acc / (cnt || 1)));
        out[o++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      return out;
    }

    const CHUNK_MS = 100;
    const SILENCE_100MS = new Uint8Array(
      new Int16Array((16000 * CHUNK_MS) / 1000).buffer
    );

    let acMic, acTab;
    let micModuleLoaded = false;
    let tabModuleLoaded = false;

    let nodeMic, nodeTab;
    let wsMic, wsTab;
    let sendTimerMic, sendTimerTab;

    let bufMic = [],
      lenMic = 0;
    let bufTab = [],
      lenTab = 0;

    let streamMic = null;
    let streamTab = null;

    const $ = (id) => document.getElementById(id);
    const statusEl = $("status");
    const interimEl = $("interim");
    const finalsEl = $("finals");

    const vQ = $("v_question");
    const vE = $("v_expected");
    const vVerd = $("v_verdict");
    const vScore = $("v_score");
    const vExplain = $("v_explain");
    const vCand = $("v_cand");
    function setBulletList(el, text) {
      if (!el) return;
      const t = (text ?? "").toString().trim();
      el.innerHTML = "";
      if (!t) return;

      let parts;
      if (t.includes("•")) {
        // backend already uses bullet dots
        parts = t.split("•");
      } else {
        // fallback: split on newlines
        parts = t.split(/\n+/);
      }

      const cleaned = parts
        .map((p) => p.replace(/^[•\-\u2022\s]+/, "").trim())
        .filter(Boolean);

      // if we can’t find real bullets, just show plain text
      if (!cleaned.length) {
        el.textContent = t;
        return;
      }

      const ul = document.createElement("ul");
      ul.className = "ir-list";

      cleaned.forEach((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        ul.appendChild(li);
      });

      el.appendChild(ul);
    }

 function scrollTranscriptToBottom() {
      if (!finalsEl) return;
      const scroller =
        finalsEl.closest(".ir-panel-body") ||
        finalsEl.parentElement ||
        finalsEl;
      scroller.scrollTop = scroller.scrollHeight;
    }
    const micBtn = $("startMic");
    const tabBtn = $("startTab");
    const stopBtn = $("stop");
    const micMenu = $("micMenu");
    const micLabelEl = $("micLabel");

    const setStatus = (t) => {
      if (statusEl) statusEl.textContent = t;
    };
function renderSuggestions(list) {
  const ul = document.getElementById("suggestions");
  if (!ul) return;

  ul.innerHTML = "";

  list.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "ir-sug-item";

    const num = document.createElement("span");
    num.className = "ir-sug-num";
    num.textContent = String(idx + 1).padStart(2, "0"); // 01, 02...

    const box = document.createElement("div");
    box.className = "ir-sug-text";

    const question =
      typeof item === "string" ? item : item.question || "";

    const answer =
      typeof item === "string"
        ? ""
        : item.answer || item.expected_answer || "";

    const qEl = document.createElement("div");
    qEl.className = "ir-sug-q";
    qEl.textContent = question;

    box.appendChild(qEl);

    if (answer) {
      const aEl = document.createElement("div");
      aEl.className = "ir-sug-a";
      aEl.textContent = answer;
      box.appendChild(aEl);
    }

    // 💡 When you click a suggestion -> fill Validation panel
    li.addEventListener("click", () => {
      if (vQ) vQ.textContent = question || "";
      if (vE) setBulletList(vE, answer || "");

      dispatch(
        setValidationData({
          question: question || "",
          expectedAnswer: answer || "",
          verdict: null,
          score: null,
          explanation: "",
          candidateAnswer: "",
        })
      );
    });

    li.appendChild(num);
    li.appendChild(box);
    ul.appendChild(li);
  });
}


    function hydrateFromStore() {
      const vState = interviewSession?.validation;
      if (vState) {
        const {
          question,
          expectedAnswer,
          verdict,
          score,
          explanation,
          candidateAnswer,
        } = vState;

           if (vQ) vQ.textContent = question || "";
        if (vE) setBulletList(vE, expectedAnswer || "");
        if (vExplain) setBulletList(vExplain, explanation || "");
        if (vCand)
          setBulletList(
            vCand,
            candidateAnswer ? `Candidate’s Answer: ${candidateAnswer}` : ""
          );

        if (vScore && typeof score === "number") {
          vScore.textContent = `Score: ${(score * 100).toFixed(0)}%`;
        }

        if (vVerd) {
          const vUpper = (verdict || "").toUpperCase();
          vVerd.textContent = vUpper;
          vVerd.className =
            "ir-badge " +
            (verdict === "right"
              ? "ir-ok"
              : verdict === "almost"
              ? "ir-warn"
              : verdict
              ? "ir-bad"
              : "");
        }
      }
  const savedSug = interviewSession?.aiSuggestions;
    if (Array.isArray(savedSug) && savedSug.length) {
      renderSuggestions(savedSug);
    }
      // const savedSug = interviewSession?.aiSuggestions;
      // if (Array.isArray(savedSug) && savedSug.length) {
      //   const ul = document.getElementById("suggestions");
      //   if (ul) {
      //     ul.innerHTML = "";
      //     savedSug.forEach((q) => {
      //       const li = document.createElement("li");
      //       li.textContent = q;
      //       ul.appendChild(li);
      //     });
      //   }
      // }

      if (interviewSession?.summary) {
        const out = document.getElementById("aiOut");
        if (out) {
          out.textContent = JSON.stringify(interviewSession.summary, null, 2);
        }
      }
    }

    hydrateFromStore();

    async function enumerateAudioInputs() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        audioInputs = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || "Microphone",
            kind: d.kind,
          }));
        renderMicMenu();
      } catch {}
    }

    async function prewarmMicPermission(forceRealPrompt = false) {
      const shouldPromptNow = !!forceRealPrompt || state?.promptMic === true;
      if (
        !("mediaDevices" in navigator) ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setStatus("mic permission: unsupported");
        return;
      }
      if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
      ) {
        setStatus("use HTTPS or localhost for mic");
      }
      try {
        if (shouldPromptNow) {
          const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
          tmp.getTracks().forEach((t) => t.stop());
        }
        setStatus("mic permission: granted");
      } catch (err) {
        setStatus("mic permission: " + (err?.name || "error"));
      } finally {
        enumerateAudioInputs();
      }
    }

    if (state?.promptMic) prewarmMicPermission(true);
    else setTimeout(() => prewarmMicPermission(false), 150);

    try {
      navigator.mediaDevices?.addEventListener?.(
        "devicechange",
        enumerateAudioInputs
      );
    } catch {}

    async function ensureSession() {
      if (sessionInitRef.current) return sessionInitRef.current;

      sessionInitRef.current = (async () => {
        const interviewId =
          interviewSession?.interviewId || state?.interviewId || null;

        if (metaRef.current.sessionId) {
          dispatch(setInterviewStatus("active"));
          return metaRef.current.sessionId;
        }

        if (!interviewId) {
          const fallback = `MEET-${Math.random().toString(36).slice(2, 9)}`;
          metaRef.current.sessionId = fallback;
          dispatch(setInterviewSessionId(fallback));
          dispatch(setInterviewStatus("active"));
          setStatus(`local session ${fallback} (no interviewId)`);
          return fallback;
        }

        try {
          const body = { interview_id: interviewId };

          const r = await fetchWithTimeout(
            `${BACKEND_HTTP}/meet/session/bootstrap`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          );

          if (!r.ok) {
            const msg = `session bootstrap failed (${r.status})`;
            setStatus(msg);
            dispatch(setInterviewError(msg));
            return metaRef.current.sessionId || "";
          }

          const data = await r.json();

          const sid =
            data.session_id ||
            data.sessionId ||
            metaRef.current.sessionId ||
            `MEET-${Math.random().toString(36).slice(2, 9)}`;

          metaRef.current.sessionId = sid;
          metaRef.current.meetingId =
            data.meeting_id ||
            data.meetingId ||
            metaRef.current.meetingId ||
            sid;

          metaRef.current.interviewer =
            data.interviewer_name ||
            data.interviewer ||
            metaRef.current.interviewer;
          metaRef.current.candidate =
            data.candidate_name ||
            data.candidate ||
            metaRef.current.candidate;
          metaRef.current.jd = data.jd ?? metaRef.current.jd;
          metaRef.current.resume = data.resume ?? metaRef.current.resume;
          metaRef.current.meetUrl = data.meet_url ?? metaRef.current.meetUrl;

          dispatch(setInterviewSessionId(sid));
          dispatch(setInterviewStatus("active"));
          dispatch(setInterviewError(null));

          dispatch(
            hydrateBootstrapMeta({
              interviewId:
                interviewId ||
                data.interview_id ||
                interviewSession?.interviewId,
              sessionId: sid,
              meetingId: metaRef.current.meetingId,
              interviewerName: metaRef.current.interviewer,
              candidateName: metaRef.current.candidate,
              jd: metaRef.current.jd,
              resume: metaRef.current.resume,
              meetUrl: metaRef.current.meetUrl,
            })
          );

          setStatus(`session ${sid} ready`);
          return sid;
        } catch (err) {
          const msg =
            err?.name === "AbortError"
              ? "session bootstrap timed out"
              : err?.message || "session bootstrap error";
          setStatus(msg);
          dispatch(setInterviewError(msg));
          return metaRef.current.sessionId || "";
        }
      })();

      return sessionInitRef.current;
    }

    function addSendButton(container, who, text) {
      const interviewerName =
        metaRef.current.interviewer?.trim() || "Interviewer";
      if (who !== interviewerName) return;

      const btn = document.createElement("button");
      btn.className = "ir-sendbtn";
      btn.title = "Send question to AI";
      btn.textContent = "➤";

      btn.addEventListener("click", async () => {
        vQ.textContent = text;
        vE.textContent = "…";
        vVerd.textContent = "";
        vScore.textContent = "";
        vExplain.textContent = "";
        vCand.textContent = "";

        dispatch(
          setValidationData({
            question: text,
            expectedAnswer: "",
            verdict: null,
            score: null,
            explanation: "",
            candidateAnswer: "",
          })
        );

        try {
          const data = await postJSON(`${BACKEND_HTTP}/ai/expected`, {
            session_id: metaRef.current.sessionId,
            question: text,
          });
          const expectedAnswer = data.expected_answer || "";
          // vE.textContent = expectedAnswer;
          setBulletList(vE, expectedAnswer);

          dispatch(
            setValidationData({
              question: text,
              expectedAnswer,
              verdict: null,
              score: null,
              explanation: "",
              candidateAnswer: "",
            })
          );
        } catch (e) {
          vE.textContent = "Error: " + e.message;
        }
      });

      container.appendChild(btn);
    }

    // WhatsApp-style bubble generator
    function lineEl(who, text, isInterviewer) {
      const row = document.createElement("div");
      row.className =
        "ir-chat-row " + (isInterviewer ? "from-interviewer" : "from-candidate");

      const bubble = document.createElement("div");
      bubble.className =
        "ir-chat-bubble " + (isInterviewer ? "interviewer" : "candidate");

      const inner = document.createElement("div");
      inner.className = "ir-chat-text";

      const whoSpan = document.createElement("span");
      whoSpan.className = "ir-chat-who";
      whoSpan.textContent = who;

      inner.appendChild(whoSpan);
      inner.appendChild(document.createTextNode(text));
      bubble.appendChild(inner);

      if (isInterviewer) addSendButton(bubble, who, text);

      row.appendChild(bubble);
      return row;
    }

    function openWS(source, sessionId, speaker, speakerName) {
      const qs = `session_id=${encodeURIComponent(
        sessionId
      )}&speaker=${encodeURIComponent(
        speaker
      )}&speaker_name=${encodeURIComponent(speakerName)}`;
      const wss = new WebSocket(`${BACKEND_WS}/ws/${source}?${qs}`);
      wss.binaryType = "arraybuffer";
      wss.onopen = () => {
        setStatus(`ws connected (${source})`);
        if (source === "mic") {
          micOn = true;
          setMicUI(true);
        }
        if (source === "tab") {
          setTabUI(true);
        }
      };
      wss.onclose = () => {
        setStatus(`ws closed (${source})`);
        if (source === "mic") {
          micOn = false;
          setMicUI(false);
        }
        if (source === "tab") {
          setTabUI(false);
        }
      };
      wss.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.text && msg.text.startsWith("[backend]")) return;
          if (msg.text && msg.final) {
            const who = msg.speaker_name || msg.speaker || msg.source;
            const isInterviewer = msg.speaker === "interviewer";
            finalsEl.appendChild(lineEl(who, msg.text, isInterviewer));
            interimEl.textContent = "";
              scrollTranscriptToBottom();
            // finalsEl.scrollTop = finalsEl.scrollHeight;
          } else if (msg.text) {
            const who = msg.speaker_name || msg.speaker || msg.source;
            interimEl.textContent = who + ": " + msg.text + " …";
          }
        } catch {}
      };
      return wss;
    }

    function startSender(which) {
      const every = CHUNK_MS;
      if (which === "mic") {
        if (sendTimerMic) return;
        sendTimerMic = setInterval(() => {
          if (!wsMic || wsMic.readyState !== WebSocket.OPEN) return;
          if (lenMic === 0) {
            wsMic.send(SILENCE_100MS);
            return;
          }
          const all = new Int16Array(lenMic);
          let off = 0;
          for (const c of bufMic) {
            all.set(c, off);
            off += c.length;
          }
          bufMic = [];
          lenMic = 0;
          wsMic.send(new Uint8Array(all.buffer));
        }, every);
      } else {
        if (sendTimerTab) return;
        sendTimerTab = setInterval(() => {
          if (!wsTab || wsTab.readyState !== WebSocket.OPEN) return;
          if (lenTab === 0) {
            wsTab.send(SILENCE_100MS);
            return;
          }
          const all = new Int16Array(lenTab);
          let off = 0;
          for (const c of bufTab) {
            all.set(c, off);
            off += c.length;
          }
          bufTab = [];
          lenTab = 0;
          wsTab.send(new Uint8Array(all.buffer));
        }, every);
      }
    }

    // function setMicUI(on) {
    //   const micBtn = document.getElementById("startMic");
    //   if (!micBtn) return;
    //   micBtn.dataset.active = on ? "1" : "0";
    //   micBtn.setAttribute("aria-pressed", on ? "true" : "false");
    //   const label = micBtn.querySelector(".label");
    //   if (label)
    //     label.textContent = on
    //       ? selectedMicLabel || "Sharing Your Audio"
    //       : "Share Your Audio";
    // }
    function setMicUI(on) {
      const micBtn = document.getElementById("startMic");
      const defaultToggle = document.getElementById("defaultMicToggle");

      if (micBtn) {
        micBtn.dataset.active = on ? "1" : "0";
        micBtn.setAttribute("aria-pressed", on ? "true" : "false");
        const label = micBtn.querySelector(".label");
        if (label)
          label.textContent = on
            ? selectedMicLabel || "Sharing Your Audio"
            : "Share Your Audio";
      }

      if (defaultToggle) {
        defaultToggle.dataset.active = on ? "1" : "0";
        defaultToggle.setAttribute("aria-pressed", on ? "true" : "false");
      }
    }
    function setTabUI(on) {
      const tabBtn = document.getElementById("startTab");
      if (!tabBtn) return;
      tabBtn.dataset.active = on ? "1" : "0";
      tabBtn.setAttribute("aria-pressed", on ? "true" : "false");
      const label = tabBtn.querySelector(".label");
      if (label)
        label.textContent = on
          ? "Interviewer Audio (On)"
          : "Candidate's Audio";
    }

    const micActive = () => micOn;
    const tabActive = () => !!(wsTab && wsTab.readyState === WebSocket.OPEN);

    async function startMic(useDeviceId = null, existingStream = null) {
      if (micOn) {
        setStatus("mic already running");
        return;
      }

      const sessionId = await ensureSession();
      const interviewerName =
        metaRef.current.interviewer?.trim() || "Interviewer";

      if (!acMic)
        acMic = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000,
        });
      if (!micModuleLoaded) {
        await acMic.audioWorklet.addModule("/static/mic-worklet.js");
        micModuleLoaded = true;
      }

      try {
        streamMic =
          existingStream ||
          (await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: useDeviceId ? { exact: useDeviceId } : undefined,
              echoCancellation: true,
              noiseSuppression: true,
            },
            video: false,
          }));
      } catch (e) {
        setStatus(e?.name === "NotAllowedError" ? "mic blocked" : "mic failed");
        setMicUI(false);
        return;
      }

      const src = acMic.createMediaStreamSource(streamMic);
      const node = new AudioWorkletNode(acMic, "mic-processor");
      node.port.onmessage = (ev) => {
        const frame = ev.data;
        if (meetMuted === true) return;
        if (meetMuted === null && rms(frame) < VAD_THRESH) return;
        const i16 = downsampleFloat32ToInt16(frame, acMic.sampleRate, 16000);
        bufMic.push(i16);
        lenMic += i16.length;
      };
      src.connect(node);
      nodeMic = node;

      micOn = true;
      setMicUI(true);

      wsMic = openWS("mic", sessionId, "interviewer", interviewerName);
      startSender("mic");
      setStatus("recording (mic)…");
    }

    function stopMic() {
      if (sendTimerMic) {
        clearInterval(sendTimerMic);
        sendTimerMic = null;
      }
      if (wsMic) {
        try {
          wsMic.close();
        } catch {}
        wsMic = null;
      }
      if (nodeMic) {
        try {
          nodeMic.disconnect();
        } catch {}
        nodeMic = null;
      }
      if (streamMic) {
        try {
          streamMic.getTracks().forEach((t) => t.stop());
        } catch {}
        streamMic = null;
      }
      bufMic = [];
      lenMic = 0;
      micOn = false;
      setMicUI(false);
      setStatus("mic off");
    }

    async function startTab(existingStream = null) {
      if (wsTab && wsTab.readyState === WebSocket.OPEN) {
        setStatus("tab already running");
        return;
      }

      let pickedStream = existingStream;
      if (!pickedStream) {
        setStatus("opening tab picker…");
        try {
          pickedStream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "browser", preferCurrentTab: true },
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
              suppressLocalAudioPlayback: true,
            },
          });
        } catch (e) {
          setStatus(
            e?.name === "NotAllowedError"
              ? "tab share cancelled"
              : "tab share failed"
          );
          setTabUI(false);
          return;
        }
      }

      if (!acTab)
        acTab = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000,
        });
      if (!tabModuleLoaded) {
        await acTab.audioWorklet.addModule("/static/mic-worklet.js");
        tabModuleLoaded = true;
      }

      streamTab = pickedStream;
      try {
        streamTab.getTracks().forEach((t) =>
          t.addEventListener("ended", () => {
            stopTab();
            setTabUI(false);
          })
        );
      } catch {}

      const src = acTab.createMediaStreamSource(streamTab);
      const node = new AudioWorkletNode(acTab, "mic-processor");
      node.port.onmessage = (ev) => {
        const frame = ev.data;
        if (rms(frame) < 0.0025) return;
        const i16 = downsampleFloat32ToInt16(frame, acTab.sampleRate, 16000);
        bufTab.push(i16);
        lenTab += i16.length;
      };
      src.connect(node);
      nodeTab = node;

      const sessionId = await ensureSession();
      const candidateName =
        metaRef.current.candidate?.trim() || "Candidate";
      wsTab = openWS("tab", sessionId, "candidate", candidateName);
      startSender("tab");
      setStatus("recording (tab)…");
      setTabUI(true);
    }

    function stopTab() {
      if (sendTimerTab) {
        clearInterval(sendTimerTab);
        sendTimerTab = null;
      }
      if (wsTab) {
        try {
          wsTab.close();
        } catch {}
        wsTab = null;
      }
      if (nodeTab) {
        try {
          nodeTab.disconnect();
        } catch {}
        nodeTab = null;
      }
      if (streamTab) {
        try {
          streamTab.getTracks().forEach((t) => t.stop());
        } catch {}
        streamTab = null;
      }
      bufTab = [];
      lenTab = 0;
      setTabUI(false);
    }

    function stopAll() {
      stopMic();
      stopTab();

      try {
        stopPiP();
      } catch {}

      try {
        mediaBus.closeMeetWindow();
      } catch {}

      setMicUI(false);
      setTabUI(false);
      setStatus("stopped");
    }

    async function postJSON(url, body) {
      const r = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }

    // const onValidate = async () => {
    //   await ensureSession();
    //   const q =
    //     (document.getElementById("v_question").textContent || "").trim();
    //   if (!q) return alert("Pick a question ( ➤) first");

    //   document.getElementById("v_verdict").textContent = "";
    //   document.getElementById("v_score").textContent = "";
    //   document.getElementById("v_explain").textContent = "…";
    //   document.getElementById("v_cand").textContent = "";

    //   try {
    //     const data = await postJSON(`${BACKEND_HTTP}/ai/validate`, {
    //       session_id: metaRef.current.sessionId,
    //       question: q,
    //     });

    //     document.getElementById("v_explain").textContent =
    //       data.explanation || "";
    //     document.getElementById("v_cand").textContent = data.candidate_answer
    //       ? `Candidate’s Answer: ${data.candidate_answer}`
    //       : "";
    //     document.getElementById(
    //       "v_score"
    //     ).textContent = `Score: ${(data.score * 100).toFixed(0)}%`;

    //     const v = (data.verdict || "").toUpperCase();
    //     const el = document.getElementById("v_verdict");
    //     el.textContent = v;
    //     el.className =
    //       "ir-badge " +
    //       (data.verdict === "right"
    //         ? "ir-ok"
    //         : data.verdict === "almost"
    //         ? "ir-warn"
    //         : "ir-bad");

    //     const expected =
    //       (document.getElementById("v_expected").textContent || "").trim();

    //     dispatch(
    //       setValidationData({
    //         question: q,
    //         expectedAnswer: expected,
    //         verdict: data.verdict || "",
    //         score: data.score,
    //         explanation: data.explanation || "",
    //         candidateAnswer: data.candidate_answer || "",
    //       })
    //     );
    //   } catch (e) {
    //     document.getElementById("v_explain").textContent =
    //       "Error: " + e.message;
    //   }
    // };

    // async function getQs(append = false) {
    //   await ensureSession();
    //   try {
    //     const url = `${BACKEND_HTTP}/ai/questions`;
    //     const data = await postJSON(url, {
    //       session_id: metaRef.current.sessionId,
    //       count: 5,
    //     });

    //     const list = Array.isArray(data?.questions)
    //       ? data.questions
    //       : Array.isArray(data)
    //       ? data
    //       : [];

    //     const ul = document.getElementById("suggestions");
    //     if (!append && ul) ul.innerHTML = "";
    //     list.forEach((q) => {
    //       const li = document.createElement("li");
    //       li.textContent = q;
    //       ul.appendChild(li);
    //     });

    //     if (ul) {
    //       const all = Array.from(ul.querySelectorAll("li")).map(
    //         (li) => li.textContent || ""
    //       );
    //       dispatch(setAISuggestions(all));
    //     }
    //   } catch (e) {
    //     alert("AI error: " + e.message);
    //   }
    // }
    const onValidate = async () => {
  await ensureSession();
  const q =
    (document.getElementById("v_question").textContent || "").trim();
  if (!q) return alert("Pick a question ( ➤) first");

  const verdictEl = document.getElementById("v_verdict");
  const scoreEl = document.getElementById("v_score");
  const explainEl = document.getElementById("v_explain");
  const candEl = document.getElementById("v_cand");

  if (verdictEl) verdictEl.textContent = "";
  if (scoreEl) scoreEl.textContent = "";
  if (explainEl) explainEl.textContent = "…";
  if (candEl) candEl.textContent = "";

  try {
    const data = await postJSON(`${BACKEND_HTTP}/ai/validate`, {
      session_id: metaRef.current.sessionId,
      question: q,
    });

    // 👉 bullet list for explanation
    setBulletList(explainEl, data.explanation || "");

    // 👉 bullet list for candidate answer
    const candLine = data.candidate_answer
      ? `Candidate’s Answer: ${data.candidate_answer}`
      : "";
    setBulletList(candEl, candLine);

    if (scoreEl) {
      scoreEl.textContent = `Score: ${(data.score * 100).toFixed(0)}%`;
    }

    const v = (data.verdict || "").toUpperCase();
    if (verdictEl) {
      verdictEl.textContent = v;
      verdictEl.className =
        "ir-badge " +
        (data.verdict === "right"
          ? "ir-ok"
          : data.verdict === "almost"
          ? "ir-warn"
          : "ir-bad");
    }

    const expected =
      (document.getElementById("v_expected").textContent || "").trim();

    dispatch(
      setValidationData({
        question: q,
        expectedAnswer: expected,
        verdict: data.verdict || "",
        score: data.score,
        explanation: data.explanation || "",
        candidateAnswer: data.candidate_answer || "",
      })
    );
  } catch (e) {
    if (explainEl) explainEl.textContent = "Error: " + e.message;
  }
};

 function normalizeQuestionsPayload(data) {
  // ✅ Preferred: backend returns both questions[] and answers[]
  if (
    data &&
    Array.isArray(data.questions) &&
    Array.isArray(data.answers) &&
    data.questions.length === data.answers.length
  ) {
    return data.questions.map((q, idx) => ({
      question: String(q),
      answer: String(data.answers[idx] ?? ""),
    }));
  }

  // 🔁 Fallbacks (old behaviour if only questions exist)
  let raw = data?.questions ?? data;
  let list = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object" && Array.isArray(raw.questions)) {
    list = raw.questions;
  } else if (typeof raw === "string") {
    let s = raw.trim();

    // strip ```json fences if present
    if (s.startsWith("```")) {
      const firstNewline = s.indexOf("\n");
      if (firstNewline !== -1) s = s.slice(firstNewline + 1);
      if (s.endsWith("```")) s = s.slice(0, -3);
      s = s.trim();
    }

    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed?.questions)) {
        list = parsed.questions;
      } else if (Array.isArray(parsed)) {
        list = parsed;
      }
    } catch {
      // fallback: split by lines
      list = s
        .split("\n")
        .map((ln) =>
          ln
            .replace(/^["'\s]+/, "")
            .replace(/["',\s]+$/, "")
            .trim()
        )
        .filter(
          (ln) =>
            ln &&
            !ln.startsWith("{") &&
            !ln.startsWith("}") &&
            !ln.startsWith("[") &&
            !ln.startsWith("]") &&
            !ln.toLowerCase().startsWith("questions")
        );
    }
  }

  // fallback → only question text, no answer
  return list.map((q) => ({ question: String(q), answer: "" }));
}

 async function getQs() {
      await ensureSession();
      try {
        const url = `${BACKEND_HTTP}/ai/questions`;
        const data = await postJSON(url, {
          session_id: metaRef.current.sessionId,
          count: 5,
        });

        const list = normalizeQuestionsPayload(data);

        renderSuggestions(list);
        dispatch(setAISuggestions(list));
      } catch (e) {
        alert("AI error: " + e.message);
      }
    }
    async function loadTurns() {
      const id = await ensureSession();
      if (!id) {
        console.warn("No sessionId – skipping /session/{id}/turns");
        return;
      }
      try {
        const r = await fetchWithTimeout(
          `${BACKEND_HTTP}/session/${encodeURIComponent(id)}/turns`,
          { method: "GET" }
        );
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        const turns = Array.isArray(data?.turns)
          ? data.turns
          : Array.isArray(data)
          ? data
          : [];
        finalsEl.innerHTML = "";
        turns.forEach((t) => {
          const who = t.speaker_name || t.speaker || "Unknown";
          const text = t.text ?? t.content ?? t.utterance ?? "";
          const isInterviewer =
            String(t.speaker || "").toLowerCase() === "interviewer";
          if (!text) return;
          finalsEl.appendChild(lineEl(who, text, isInterviewer));
        });
           scrollTranscriptToBottom();
      } catch (e) {
        console.warn("turns fetch failed:", e);
      }
    }

    const onSummary = async () => {
      await ensureSession();
      const out = document.getElementById("aiOut");
      out.textContent = "…";
      try {
        const data = await postJSON(`${BACKEND_HTTP}/ai/summary`, {
          session_id: metaRef.current.sessionId,
        });
        out.textContent = JSON.stringify(data, null, 2);

        dispatch(setSummary(data));
      } catch (e) {
        out.textContent = "Error: " + e.message;
      }
    };

    function renderMicMenu() {
      if (!micMenu) return;
      micMenu.innerHTML = "";

      const title = document.createElement("h4");
      title.textContent = "Select microphone";
      micMenu.appendChild(title);

      const def = document.createElement("button");
      def.className = "item";
      def.textContent = "System Default";
      def.dataset.active = selectedMicId ? "0" : "1";
      def.addEventListener("click", async () => {
        selectedMicId = null;
        selectedMicLabel = "System Default";
        micLabelEl && (micLabelEl.textContent = "Share Your Audio");
        renderMicMenu();
        if (micActive()) {
          stopMic();
          await startMic(null);
        }
        closeMicMenu();
      });
      micMenu.appendChild(def);

      for (const d of audioInputs) {
        const b = document.createElement("button");
        b.className = "item";
        b.textContent = d.label || "Microphone";
        b.dataset.active = d.deviceId === selectedMicId ? "1" : "0";
        b.addEventListener("click", async () => {
          selectedMicId = d.deviceId || null;
          selectedMicLabel = d.label || "Microphone";
          micLabelEl && (micLabelEl.textContent = "Share Your Audio");
          renderMicMenu();
          if (micActive()) {
            stopMic();
            await startMic(selectedMicId);
          }
          closeMicMenu();
        });
        micMenu.appendChild(b);
      }

      const line = document.createElement("div");
      line.className = "line";
      micMenu.appendChild(line);

      const refresh = document.createElement("button");
      refresh.className = "item";
      refresh.textContent = "Refresh device list";
      refresh.addEventListener("click", async () => {
        await enumerateAudioInputs();
      });
      micMenu.appendChild(refresh);

      const off = document.createElement("button");
      off.className = "item";
      off.textContent = micActive()
        ? "Turn off microphone"
        : "Microphone is off";
      off.disabled = !micActive();
      off.addEventListener("click", () => {
        stopMic();
        closeMicMenu();
      });
      micMenu.appendChild(off);
    }

    function openMicMenu() {
      if (!micMenu) return;
      renderMicMenu();
      micMenu.dataset.open = "1";
      micBtn?.setAttribute("aria-expanded", "true");
      setTimeout(() => {
        document.addEventListener("click", outsideCloseOnce, {
          capture: true,
          once: true,
        });
      }, 0);
    }
    function closeMicMenu() {
      if (!micMenu) return;
      micMenu.dataset.open = "0";
      micBtn?.setAttribute("aria-expanded", "false");
    }
    function outsideCloseOnce(e) {
      if (!micMenu || !micBtn) return;
      if (micMenu.contains(e.target) || micBtn.contains(e.target)) {
        document.addEventListener("click", outsideCloseOnce, {
          capture: true,
          once: true,
        });
        return;
      }
      closeMicMenu();
    }

    const micBodyHandler = async () => {
      if (micActive()) {
        stopMic();
      } else {
        await startMic(selectedMicId);
      }
    };
       const defaultMicClickHandler = async () => {
      if (micActive()) {
        // mic already on → turn it off
        stopMic();
      } else {
        // force system default
        selectedMicId = null;
        selectedMicLabel = "System Default";
        await startMic(null);
      }
    };
    const micCaretHandler = (ev) => {
      ev.stopPropagation();
      const open = micMenu?.dataset.open === "1";
      if (open) closeMicMenu();
      else openMicMenu();
    };
    const micButtonFallbackHandler = (ev) => {
      const caret = document.getElementById("micCaret");
      const menu = document.getElementById("micMenu");
      if (caret?.contains(ev.target) || menu?.contains(ev.target)) return;
      micBodyHandler();
    };

    const tabClickHandler = async () => {
      if (tabActive()) {
        stopTab();
      } else {
        await startTab();
      }
    };

   const stopClickHandler = () => {
  stopAll();

  const elapsedMs = Date.now() - timerStartRef.current;
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

  // ✅ figure out session & interview IDs
  const sid =
    metaRef.current.sessionId ||
    interviewSession?.sessionId ||
    state?.sessionId ||
    null;

  const iid =
    interviewSession?.interviewId ||
    state?.interviewId ||
    sid ||
    null;

  // ✅ only fetch summary if we have a session
  if (sid) {
    dispatch(fetchSummaryRequest());
  }

  // mark interview as ended (your reducer should NOT wipe summary/session)
  dispatch(endInterviewSession());

  // ✅ pass IDs via route state so the Guard allows entry
  navigate("/interview/report", {
    replace: true,
    state: {
      sessionId: sid,
      interviewId: iid,
      durationSeconds: elapsedSeconds,
    },
  });
};

    const getQsHandler = () => getQs(false);
    const loadTurnsHandler = () => loadTurns();

    document
      .getElementById("v_validate")
      ?.addEventListener("click", onValidate);
    document.getElementById("getQs")?.addEventListener("click", getQsHandler);
    document
      .getElementById("aiSummary")
      ?.addEventListener("click", onSummary);
    document
      .getElementById("loadTurns")
      ?.addEventListener("click", loadTurnsHandler);

      const micBody = document.getElementById("micBody");
    const micCaret = document.getElementById("micCaret");
    const defaultMicBtnEl = document.getElementById("defaultMicToggle");

    micBody?.addEventListener("click", micBodyHandler);
    micCaret?.addEventListener("click", micCaretHandler);
    micBtn?.addEventListener("click", micButtonFallbackHandler);
      defaultMicBtnEl?.addEventListener("click", defaultMicClickHandler);

    tabBtn?.addEventListener("click", tabClickHandler);
    stopBtn?.addEventListener("click", stopClickHandler);

    enumerateAudioInputs();
    loadTurns();

    (async () => {
      const wants = state?.autostart || {};
      try {
        if (wants.mic && mediaBus.micStream) {
          await startMic(null, mediaBus.takeMicStream());
        }
        if (wants.tab && mediaBus.tabStream) {
          await startTab(mediaBus.takeTabStream());
        }
      } catch (e) {
        console.warn("Autostart failed:", e);
      }
    })();

    return () => {
      document
        .getElementById("v_validate")
        ?.removeEventListener("click", onValidate);
      document
        .getElementById("getQs")
        ?.removeEventListener("click", getQsHandler);
      document
        .getElementById("aiSummary")
        ?.removeEventListener("click", onSummary);
      document
        .getElementById("loadTurns")
        ?.removeEventListener("click", loadTurnsHandler);

      micBody?.removeEventListener("click", micBodyHandler);
      micCaret?.removeEventListener("click", micCaretHandler);
      micBtn?.removeEventListener("click", micButtonFallbackHandler);
          defaultMicBtnEl?.removeEventListener("click", defaultMicClickHandler);
      tabBtn?.removeEventListener("click", tabClickHandler);
      stopBtn?.removeEventListener("click", stopClickHandler);

      try {
        navigator.mediaDevices?.removeEventListener?.(
          "devicechange",
          enumerateAudioInputs
        );
      } catch {}

      sessionInitRef.current = null;

      stopAll();
      document.body.classList.remove("interview-room-body");
    };
  // }, [state, dispatch, interviewSession, sessionInitRef, navigate]);
 }, [state, dispatch, navigate]);
  const IconMic = (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z" />
      <path d="M5 11a1 1 0 1 0-2 0 9 9 0 0 0 8 8v3h2v-3a9 9 0 0 0 8-8 1 1 0 1 0-2 0 7 7 0 0 1-14 0z" />
    </svg>
  );
  const IconChevronDown = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" {...p}>
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
    </svg>
  );
  const IconMonitor = (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6v2h3v2H8v-2h3v-2H5a2 2 0 0 1-2-2V5z" />
    </svg>
  );
  const IconExit = (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3z" />
      <path d="M15.59 7.41 14.17 8.83 16.34 11H9v2h7.34l-2.17 2.17 1.42 1.42L21 12l-5.41-4.59z" />
    </svg>
  );

  return (
    <div className="ir-wrap">
      <style>{styles}</style>

      <header className="ir-header">
        <div className="ir-row">
       <button
  id="defaultMicToggle"
  className="ir-btn compact micbtn"
  title="Toggle system default microphone"
  aria-pressed="false"
>
  {/* Mic ON icon */}
  <span className="ir-icon mic icon-mic-on">
    <IconMic />
  </span>

  {/* Mic OFF icon */}
  <span className="ir-icon mic icon-mic-off">
    <IconMicOff />
  </span>
</button>

          <button
            id="startMic"
            className="ir-btn icon micbtn"
            title="Share your microphone"
            aria-expanded="false"
          >
            <span className="split">
              <span id="micBody" className="body">
                {/* <span className="ir-icon mic">
                  <IconMic />
                </span> */}
                <span id="micLabel" className="label">
                Select your Audio
                </span>
              </span>
              <span id="micCaret" className="caret" aria-haspopup="menu">
                <IconChevronDown />
              </span>
            </span>
            <div
              id="micMenu"
              className="ir-menu"
              role="menu"
              aria-label="Select microphone"
            ></div>
          </button>

       <button
            id="startTab"
            className="ir-btn icon secondary tabbtn"
            title="Capture Meet tab audio"
          >
            <span className="ir-icon monitor">
              <IconMonitor />
            </span>
            <span className="label">Candidate Audio</span>
          </button>

          <button
            type="button"
            className="ir-btn secondary"
            onClick={() => setShowResumePanel(true)}
          >
            View Resume
          </button>

          {/* ⏱ Timer + Exit + Status on the right */}
          <div className="ir-timer-stack">
            <div className="ir-timer-shell" aria-label="Interview duration">
              <svg className="ir-timer-svg" viewBox="0 0 48 48">
                <circle
                  className="ir-timer-track"
                  cx="24"
                  cy="24"
                  r={radius}
                />
                <circle
                  className="ir-timer-progress"
                  cx="24"
                  cy="24"
                  r={radius}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                  }}
                />
              </svg>
              <div className="ir-timer-label">{timerLabel}</div>
            </div>
</div>
            <button
              id="stop"
              className="ir-btn icon danger"
              title="Exit interview session"
            >
              <span className="ir-icon">
                <IconExit />
              </span>
              <span className="label">Exit</span>
            </button>

            <span id="status" className="ir-pill">
              idle
            </span>
          </div>
      </header>

      <main className="ir-main ir-stack">
        <section className="ir-grid">
          {/* Transcript */}
          <div className="ir-panel">
            <div className="ir-pill" style={{ marginBottom: 8 }}>
              Transcript
            </div>
            <div className="ir-panel-body">
    <div id="interim" className="ir-interim" />
    <div id="finals" className="ra-scroll ir-chatlog" />
  </div>
            <div className="ir-tiny">
              {/* Tip: Send (➤) appears only for <em>interviewer</em> lines. */}
            </div>
          </div>

          {/* Validation */}
       <div className="ir-panel">
  <div className="ir-pill" style={{ marginBottom: 8 }}>
    Validation
  </div>

  <div className="ir-panel-body">
    <div style={{ marginBottom: 8 }}>
      <strong>Question:</strong> <span id="v_question" />
    </div>
    <div style={{ marginBottom: 8 }}>
      <strong>Expected Answer</strong>
      <div id="v_expected" style={{ marginTop: 6 }} />
    </div>
    <button id="v_validate" className="ir-btn secondary">
      Validate
    </button>
    <div id="v_out" style={{ marginTop: 10 }}>
      <span id="v_verdict" className="ir-badge" />
      <span id="v_score" className="ir-tiny" />
      <div id="v_explain" style={{ marginTop: 6 }} />
      <div id="v_cand" className="ir-tiny" style={{ marginTop: 6 }} />
    </div>
  </div>
</div>

          {/* AI suggestions + summary */}
         <div className="ir-panel ir-rightbox">
            <div className="ir-panel-head">
              <div className="ir-pill">AI Question Suggestions</div>
              <button
                id="getQs"
                className="ir-btn secondary compact"
              >
                AI Questions
              </button>
            </div>

            <div className="ir-panel-body">
              <ul id="suggestions" className="ir-sug-list" />
            </div>
          </div>
        </section>
      </main>
       <RightSidePanel
        open={showResumePanel}
        onClose={() => setShowResumePanel(false)}
        title={`${candidateName}'s Resume`}
        showWorkflow={false}   // hide JD/Workflow buttons
      >
        <div className="mt-2 space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Resume
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
            {resumeText ? (
              <pre className="whitespace-pre-wrap font-sans">
                {resumeText}
              </pre>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                No resume text available for this candidate.
              </span>
            )}
          </div>
        </div>
      </RightSidePanel>
    </div>
  );
}
