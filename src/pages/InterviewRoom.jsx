// src/pages/InterviewRoom.jsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import mediaBus, { stopPiP } from "@/lib/mediaBus";

const styles = `
:root { --bg:#0b0f14; --fg:#e6edf3; --muted:#9aa3ac; --chip:#1f2937; }
body.interview-room-body { background:var(--bg); }
.ir-wrap { color:var(--fg); font:15px/1.45 system-ui, sans-serif; }
.ir-header { padding:16px 20px; border-bottom:1px solid #111827; display:flex; gap:12px; align-items:center; }
.ir-main { width:100%; max-width:none; margin:18px 0; padding:0 16px 80px; }
.ir-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
.ir-btn { padding:10px 14px; border-radius:10px; background:#2563eb; color:white; border:none; cursor:pointer; }
.ir-btn.secondary { background:#374151; } .ir-btn.danger { background:#7f1d1d; }
.ir-btn.icon{display:flex;align-items:center;gap:8px; position:relative; }
.ir-btn .caret{display:inline-flex;margin-left:6px}
.ir-icon{display:inline-flex;line-height:0}
.ir-icon.mic{color:#ef4444} .ir-icon.monitor{color:#22c55e}
.ir-btn[data-active="1"]{outline:1px solid #22c55e;background:#102a19}
.ir-btn.micbtn[data-active="1"]{outline-color:#ef4444;background:#2a0f14}
.ir-btn .split { display:inline-flex; align-items:center; gap:6px; }
.ir-btn .split .body { display:inline-flex; align-items:center; gap:8px; }
.ir-btn .split .caret { padding-left:6px; border-left:1px solid rgba(255,255,255,.15); margin-left:6px; }
.ir-pill { background:var(--chip); color:var(--muted); border-radius:999px; padding:6px 10px; }
.ir-panel { background:#0f172a; border:1px solid #1f2937; border-radius:14px; padding:14px; }
.ir-interim { color:#cbd5e1; font-style:italic; opacity:.9; min-height:22px; }
.ir-final { margin:6px 0; padding:8px 10px; background:#0b1220; border:1px solid #1f2937; border-radius:10px; display:flex; justify-content:space-between; gap:8px; align-items:center; }
.ir-final .text { flex:1; }
.ir-who { color:#93c5fd; margin-right:8px; font-weight:600; }
.ir-sendbtn { background:#1f2937; border:1px solid #334155; color:#d1d5db; border-radius:8px; padding:6px 10px; cursor:pointer; display:flex; align-items:center; gap:6px; }
.ir-sendbtn:hover { background:#2a3648; }
.ir-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
@media (max-width:1280px){ .ir-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width:860px) { .ir-grid { grid-template-columns: 1fr; } }
.ir-stack { display:flex; flex-direction:column; gap:8px; }
.ir-pre { white-space:pre-wrap; } .ir-tiny { font-size:12px; color:var(--muted); }
.ir-badge { padding:2px 6px; border-radius:6px; font-size:12px; }
.ir-ok { background:#064e3b; color:#a7f3d0; } .ir-warn { background:#4f46e5; color:#e0e7ff; } .ir-bad { background:#7f1d1d; color:#fecaca; }
.ir-rightbox { display:flex; flex-direction:column; gap:10px; position:relative; }
.ir-summary-wrap { margin-top:auto; }
/* dropdown */
.ir-menu{position:absolute;top:100%;left:0;margin-top:8px;min-width:280px;background:#0b1220;border:1px solid #1f2937;border-radius:12px;padding:8px;box-shadow:0 10px 30px rgba(0,0,0,0.35);z-index:1000;display:none;}
.ir-menu[data-open="1"]{display:block;}
.ir-menu h4{margin:4px 6px 8px;font-size:12px;color:#9aa3ac;font-weight:600;letter-spacing:.04em;}
.ir-menu .item{width:100%;text-align:left;background:#0f172a;border:1px solid #1f2937;color:#cbd5e1;padding:8px 10px;border-radius:10px;cursor:pointer;margin:4px 0;}
.ir-menu .item:hover{background:#142036;} .ir-menu .item[data-active="1"]{outline:1px solid #2563eb;background:#13233f;} .ir-menu .line{height:1px;background:#1f2937;margin:8px 2px;}
`;

export default function InterviewRoom() {
  const { state } = useLocation() || {};
  const metaRef = useRef({
    sessionId: state?.sessionId || "",
    interviewer: state?.interviewer || "",
    candidate: state?.candidate || "",
    jd: state?.jd || "",
    resume: state?.resume || "",
    meetUrl: state?.meetUrl || "",
  });

  useEffect(() => {
    document.body.classList.add("interview-room-body");

    // HTTP base (env or default to Render)
    const BACKEND_HTTP =
      (import.meta?.env?.VITE_BACKEND_HTTP?.replace(/\/$/, "")) ||
      "https://recruit-meet-ai-4.onrender.com";

    // WS base derived from HTTP
    const httpURL = new URL(BACKEND_HTTP);
    const BACKEND_WS =
      (httpURL.protocol === "https:" ? "wss://" : "ws://") + httpURL.host;

    // ===== Device/UI state =====
    let selectedMicId = null;
    let selectedMicLabel = "System Default";
    let audioInputs = [];
    let micOn = false;

    // Optional: Meet mute sync via BroadcastChannel
    let meetMuted = null;
    try {
      const bc = new BroadcastChannel("meet-mute");
      bc.onmessage = (ev) => {
        if (typeof ev.data?.muted === "boolean") meetMuted = ev.data.muted;
      };
    } catch {}

    // VAD (RMS)
    const VAD_THRESH = 0.0025;
    function rms(frame) {
      let s = 0;
      for (let i = 0; i < frame.length; i++) s += frame[i] * frame[i];
      return Math.sqrt(s / frame.length);
    }

    // 48k Float32 -> 16k Int16
    function downsampleFloat32ToInt16(float32, inRate, outRate = 16000) {
      const ratio = inRate / outRate;
      const newLen = Math.floor(float32.length / ratio);
      const out = new Int16Array(newLen);
      let o = 0, i = 0;
      while (o < newLen) {
        const next = Math.round((o + 1) * ratio);
        let acc = 0, cnt = 0;
        while (i < next && i < float32.length) { acc += float32[i++]; cnt++; }
        const sample = Math.max(-1, Math.min(1, acc / (cnt || 1)));
        out[o++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      return out;
    }

    const CHUNK_MS = 100;
    const SILENCE_100MS = new Uint8Array(
      new Int16Array((16000 * CHUNK_MS) / 1000).buffer
    );

    // audio contexts
    let acMic, acTab;
    let micModuleLoaded = false;
    let tabModuleLoaded = false;

    let nodeMic, nodeTab;
    let wsMic, wsTab;
    let sendTimerMic, sendTimerTab;

    let bufMic = [], lenMic = 0;
    let bufTab = [], lenTab = 0;

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

    const micBtn = $("startMic");
    const tabBtn = $("startTab");
    const stopBtn = $("stop");
    const micMenu = $("micMenu");
    const micLabelEl = $("micLabel");

    const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };

    async function enumerateAudioInputs() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        audioInputs = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone", kind: d.kind }));
        renderMicMenu();
      } catch {}
    }

    async function prewarmMicPermission(forceRealPrompt = false) {
      const shouldPromptNow = !!forceRealPrompt || state?.promptMic === true;
      if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
        setStatus("mic permission: unsupported"); return;
      }
      if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
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
      navigator.mediaDevices?.addEventListener?.("devicechange", enumerateAudioInputs);
    } catch {}

    async function ensureSession() {
      if (!metaRef.current.sessionId) {
        metaRef.current.sessionId = `MEET-${Math.random().toString(36).slice(2, 9)}`;
      }
      try {
        const body = {
          meeting_id: metaRef.current.sessionId,
          interviewer_name: metaRef.current.interviewer || "",
          candidate_name: metaRef.current.candidate || "",
          jd: metaRef.current.jd || "",
          resume: metaRef.current.resume || "",
          meet_url: metaRef.current.meetUrl || "",
        };

        const r = await fetch(`${BACKEND_HTTP}/session/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (r.ok) {
          let data = null;
          try { data = await r.json(); } catch {}
          if (data) {
            // Allow backend to echo/override fields
            metaRef.current.interviewer = data.interviewer_name ?? metaRef.current.interviewer;
            metaRef.current.candidate   = data.candidate_name   ?? metaRef.current.candidate;
            metaRef.current.jd          = data.jd               ?? metaRef.current.jd;
            metaRef.current.resume      = data.resume           ?? metaRef.current.resume;
            metaRef.current.meetUrl     = data.meet_url         ?? metaRef.current.meetUrl;
          }
          setStatus(`session ${metaRef.current.sessionId} ready`);
        } else {
          setStatus("session/start failed");
        }
      } catch {
        setStatus(`session ${metaRef.current.sessionId} (offline)`);
      }
      return metaRef.current.sessionId;
    }

    function addSendButton(div, who, text) {
      const interviewerName = metaRef.current.interviewer?.trim() || "Interviewer";
      if (who !== interviewerName) return;
      const btn = document.createElement("button");
      btn.className = "ir-sendbtn";
      btn.title = "Send question to AI";
      btn.innerHTML = "➤ Send";
      btn.addEventListener("click", async () => {
        vQ.textContent = text;
        vE.textContent = "…";
        vVerd.textContent = "";
        vScore.textContent = "";
        vExplain.textContent = "";
        vCand.textContent = "";
        try {
          const data = await postJSON(`${BACKEND_HTTP}/ai/expected`, {
            session_id: metaRef.current.sessionId, question: text,
          });
          vE.textContent = data.expected_answer || "";
        } catch (e) { vE.textContent = "Error: " + e.message; }
      });
      div.appendChild(btn);
    }

    function lineEl(who, text, isInterviewer) {
      const wrap = document.createElement("div");
      wrap.className = "ir-final";
      const t = document.createElement("div");
      t.className = "text";
      const span = document.createElement("span");
      span.className = "ir-who";
      span.textContent = who + ":";
      t.appendChild(span);
      t.appendChild(document.createTextNode(" " + text));
      wrap.appendChild(t);
      if (isInterviewer) addSendButton(wrap, who, text);
      return wrap;
    }

    function openWS(source, sessionId, speaker, speakerName) {
      const qs = `session_id=${encodeURIComponent(sessionId)}&speaker=${encodeURIComponent(speaker)}&speaker_name=${encodeURIComponent(speakerName)}`;
      const wss = new WebSocket(`${BACKEND_WS}/ws/${source}?${qs}`);
      wss.binaryType = "arraybuffer";
      wss.onopen = () => {
        setStatus(`ws connected (${source})`);
        if (source === "mic") { micOn = true; setMicUI(true); }
        if (source === "tab") { setTabUI(true); }
      };
      wss.onclose = () => {
        setStatus(`ws closed (${source})`);
        if (source === "mic") { micOn = false; setMicUI(false); }
        if (source === "tab") { setTabUI(false); }
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
            finalsEl.scrollTop = finalsEl.scrollHeight;
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
          if (lenMic === 0) { wsMic.send(SILENCE_100MS); return; }
          const all = new Int16Array(lenMic);
          let off = 0;
          for (const c of bufMic) { all.set(c, off); off += c.length; }
          bufMic = []; lenMic = 0;
          wsMic.send(new Uint8Array(all.buffer));
        }, every);
      } else {
        if (sendTimerTab) return;
        sendTimerTab = setInterval(() => {
          if (!wsTab || wsTab.readyState !== WebSocket.OPEN) return;
          if (lenTab === 0) { wsTab.send(SILENCE_100MS); return; }
          const all = new Int16Array(lenTab);
          let off = 0;
          for (const c of bufTab) { all.set(c, off); off += c.length; }
          bufTab = []; lenTab = 0;
          wsTab.send(new Uint8Array(all.buffer));
        }, every);
      }
    }

    function setMicUI(on){
      const micBtn = document.getElementById("startMic");
      if(!micBtn) return;
      micBtn.dataset.active = on ? "1" : "0";
      micBtn.setAttribute("aria-pressed", on ? "true" : "false");
      const label = micBtn.querySelector(".label");
      if (label) label.textContent = on ? (selectedMicLabel || "Sharing Your Audio") : "Share Your Audio";
    }
    function setTabUI(on){
      const tabBtn = document.getElementById("startTab");
      if(!tabBtn) return;
      tabBtn.dataset.active = on ? "1" : "0";
      tabBtn.setAttribute("aria-pressed", on ? "true" : "false");
      const label = tabBtn.querySelector(".label");
      if (label) label.textContent = on ? "Interviewer Audio (On)" : "Simulated Interviewer Audio";
    }

    const micActive = () => micOn;
    const tabActive = () => !!(wsTab && wsTab.readyState === WebSocket.OPEN);

    // ===== MIC (accept prepared stream) =====
    async function startMic(useDeviceId = null, existingStream = null) {
      if (micOn) { setStatus("mic already running"); return; }

      const sessionId = await ensureSession();
      const interviewerName = metaRef.current.interviewer?.trim() || "Interviewer";

      if (!acMic)
        acMic = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
      if (!micModuleLoaded) {
        await acMic.audioWorklet.addModule("/static/mic-worklet.js");
        micModuleLoaded = true;
      }

      try {
        streamMic = existingStream || await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: useDeviceId ? { exact: useDeviceId } : undefined,
            echoCancellation: true, noiseSuppression: true
          },
          video: false
        });
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
        if (meetMuted === null && rms(frame) <  VAD_THRESH) return;
        const i16 = downsampleFloat32ToInt16(frame, acMic.sampleRate, 16000);
        bufMic.push(i16); lenMic += i16.length;
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
      if (sendTimerMic) { clearInterval(sendTimerMic); sendTimerMic = null; }
      if (wsMic) { try { wsMic.close(); } catch {} wsMic = null; }
      if (nodeMic) { try { nodeMic.disconnect(); } catch {} nodeMic = null; }
      if (streamMic) { try { streamMic.getTracks().forEach((t) => t.stop()); } catch {} streamMic = null; }
      bufMic = []; lenMic = 0;
      micOn = false;
      setMicUI(false);
      setStatus("mic off");
    }

    // ===== TAB (accept prepared stream) =====
    async function startTab(existingStream = null) {
      if (wsTab && wsTab.readyState === WebSocket.OPEN) {
        setStatus("tab already running"); return;
      }

      let pickedStream = existingStream;
      if (!pickedStream) {
        setStatus("opening tab picker…");
        try {
          pickedStream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "browser", preferCurrentTab: true },
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, suppressLocalAudioPlayback: true }
          });
        } catch (e) {
          setStatus(e?.name === "NotAllowedError" ? "tab share cancelled" : "tab share failed");
          setTabUI(false);
          return;
        }
      }

      if (!acTab)
        acTab = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
      if (!tabModuleLoaded) {
        await acTab.audioWorklet.addModule("/static/mic-worklet.js");
        tabModuleLoaded = true;
      }

      streamTab = pickedStream;
      try {
        streamTab.getTracks().forEach(t =>
          t.addEventListener("ended", () => { stopTab(); setTabUI(false); })
        );
      } catch {}

      const src = acTab.createMediaStreamSource(streamTab);
      const node = new AudioWorkletNode(acTab, "mic-processor");
      node.port.onmessage = (ev) => {
        const frame = ev.data;
        if (rms(frame) < 0.0025) return;
        const i16 = downsampleFloat32ToInt16(frame, acTab.sampleRate, 16000);
        bufTab.push(i16); lenTab += i16.length;
      };
      src.connect(node);
      nodeTab = node;

      const sessionId = await ensureSession();
      const candidateName = metaRef.current.candidate?.trim() || "Candidate";
      wsTab = openWS("tab", sessionId, "candidate", candidateName);
      startSender("tab");
      setStatus("recording (tab)…");
      setTabUI(true);
    }

    function stopTab() {
      if (sendTimerTab) { clearInterval(sendTimerTab); sendTimerTab = null; }
      if (wsTab) { try { wsTab.close(); } catch {} wsTab = null; }
      if (nodeTab) { try { nodeTab.disconnect(); } catch {} nodeTab = null; }
      if (streamTab) { try { streamTab.getTracks().forEach((t) => t.stop()); } catch {} streamTab = null; }
      bufTab = []; lenTab = 0;
      setTabUI(false);
    }

    function stopAll() {
      // Stop your streams & sockets
      stopMic();
      stopTab();

      // Exit PiP if active
      try { stopPiP(); } catch {}

      // Close the Meet tab if we opened it in Preflight
      try { mediaBus.closeMeetWindow(); } catch {}

      setMicUI(false);
      setTabUI(false);
      setStatus("stopped");
    }

    async function postJSON(url, body) {
      const r = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }

    const onValidate = async () => {
      await ensureSession();
      const q = (document.getElementById("v_question").textContent || "").trim();
      if (!q) return alert("Pick a question (send ➤) first");
      document.getElementById("v_verdict").textContent = "";
      document.getElementById("v_score").textContent = "";
      document.getElementById("v_explain").textContent = "…";
      document.getElementById("v_cand").textContent = "";
      try {
        const data = await postJSON(`${BACKEND_HTTP}/ai/validate`, {
          session_id: metaRef.current.sessionId, question: q,
        });
        document.getElementById("v_explain").textContent = data.explanation || "";
        document.getElementById("v_cand").textContent = data.candidate_answer ? `Candidate’s Answer: ${data.candidate_answer}` : "";
        document.getElementById("v_score").textContent = `Score: ${(data.score * 100).toFixed(0)}%`;
        const v = (data.verdict || "").toUpperCase();
        const el = document.getElementById("v_verdict");
        el.textContent = v;
        el.className = "ir-badge " + (data.verdict === "right" ? "ir-ok" : data.verdict === "almost" ? "ir-warn" : "ir-bad");
      } catch (e) {
        document.getElementById("v_explain").textContent = "Error: " + e.message;
      }
    };

    // Use single endpoint for follow-ups
    async function getQs(append = false) {
      await ensureSession();
      try {
        const url = `${BACKEND_HTTP}/ai/questions`;
        const data = await postJSON(url, {
          session_id: metaRef.current.sessionId,
          count: 5,
        });
        if (!append) document.getElementById("suggestions").innerHTML = "";
        const list = Array.isArray(data?.questions) ? data.questions : (Array.isArray(data) ? data : []);
        list.forEach((q) => {
          const li = document.createElement("li");
          li.textContent = q;
          document.getElementById("suggestions").appendChild(li);
        });
      } catch (e) {
        alert("AI error: " + e.message);
      }
    }

    // Load stored transcript turns (GET /session/{id}/turns)
    async function loadTurns() {
      const id = await ensureSession();
      try {
        const r = await fetch(`${BACKEND_HTTP}/session/${encodeURIComponent(id)}/turns`);
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        const turns = Array.isArray(data?.turns) ? data.turns : (Array.isArray(data) ? data : []);
        finalsEl.innerHTML = "";
        turns.forEach(t => {
          const who = t.speaker_name || t.speaker || "Unknown";
          const text = t.text ?? t.content ?? t.utterance ?? "";
          const isInterviewer = String(t.speaker || "").toLowerCase() === "interviewer";
          if (!text) return;
          finalsEl.appendChild(lineEl(who, text, isInterviewer));
        });
        finalsEl.scrollTop = finalsEl.scrollHeight;
      } catch (e) {
        console.warn("turns fetch failed:", e);
      }
    }

    const onSummary = async () => {
      await ensureSession();
      const out = document.getElementById("aiOut");
      out.textContent = "…";
      try {
        const data = await postJSON(`${BACKEND_HTTP}/ai/summary`, { session_id: metaRef.current.sessionId });
        out.textContent = JSON.stringify(data, null, 2);
      } catch (e) { out.textContent = "Error: " + e.message; }
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
        selectedMicId = null; selectedMicLabel = "System Default";
        micLabelEl && (micLabelEl.textContent = "Share Your Audio");
        renderMicMenu(); if (micActive()) { stopMic(); await startMic(null); } closeMicMenu();
      });
      micMenu.appendChild(def);

      for (const d of audioInputs) {
        const b = document.createElement("button");
        b.className = "item";
        b.textContent = d.label || "Microphone";
        b.dataset.active = d.deviceId === selectedMicId ? "1" : "0";
        b.addEventListener("click", async () => {
          selectedMicId = d.deviceId || null; selectedMicLabel = d.label || "Microphone";
          micLabelEl && (micLabelEl.textContent = "Share Your Audio");
          renderMicMenu(); if (micActive()) { stopMic(); await startMic(selectedMicId); } closeMicMenu();
        });
        micMenu.appendChild(b);
      }

      const line = document.createElement("div"); line.className = "line"; micMenu.appendChild(line);

      const refresh = document.createElement("button");
      refresh.className = "item"; refresh.textContent = "Refresh device list";
      refresh.addEventListener("click", async () => { await enumerateAudioInputs(); });
      micMenu.appendChild(refresh);

      const off = document.createElement("button");
      off.className = "item"; off.textContent = micActive() ? "Turn off microphone" : "Microphone is off";
      off.disabled = !micActive();
      off.addEventListener("click", () => { stopMic(); closeMicMenu(); });
      micMenu.appendChild(off);
    }

    function openMicMenu() {
      if (!micMenu) return;
      renderMicMenu(); micMenu.dataset.open = "1";
      micBtn?.setAttribute("aria-expanded", "true");
      setTimeout(() => { document.addEventListener("click", outsideCloseOnce, { capture: true, once: true }); }, 0);
    }
    function closeMicMenu() {
      if (!micMenu) return;
      micMenu.dataset.open = "0"; micBtn?.setAttribute("aria-expanded", "false");
    }
    function outsideCloseOnce(e) {
      if (!micMenu || !micBtn) return;
      if (micMenu.contains(e.target) || micBtn.contains(e.target)) {
        document.addEventListener("click", outsideCloseOnce, { capture: true, once: true }); return;
      }
      closeMicMenu();
    }

    const micBodyHandler = async () => { if (micActive()) { stopMic(); } else { await startMic(selectedMicId); } };
    const micCaretHandler = (ev) => { ev.stopPropagation(); const open = micMenu?.dataset.open === "1"; if (open) closeMicMenu(); else openMicMenu(); };
    const micButtonFallbackHandler = (ev) => {
      const caret = document.getElementById("micCaret"); const menu  = document.getElementById("micMenu");
      if (caret?.contains(ev.target) || menu?.contains(ev.target)) return; micBodyHandler();
    };

    const tabClickHandler = async () => { if (tabActive()) { stopTab(); } else { await startTab(); } };
    const stopClickHandler = () => { stopAll(); };
    const getQsHandler = () => getQs(false);
    const moreQsHandler = () => getQs(true);
    const loadTurnsHandler = () => loadTurns();

    document.getElementById("v_validate")?.addEventListener("click", onValidate);
    document.getElementById("getQs")?.addEventListener("click", getQsHandler);
    document.getElementById("moreQs")?.addEventListener("click", moreQsHandler);
    document.getElementById("aiSummary")?.addEventListener("click", onSummary);
    document.getElementById("loadTurns")?.addEventListener("click", loadTurnsHandler);

    const micBody = document.getElementById("micBody");
    const micCaret = document.getElementById("micCaret");
    micBody?.addEventListener("click", micBodyHandler);
    micCaret?.addEventListener("click", micCaretHandler);
    micBtn?.addEventListener("click", micButtonFallbackHandler);

    tabBtn?.addEventListener("click", tabClickHandler);
    stopBtn?.addEventListener("click", stopClickHandler);

    // Initial enumerate + load any existing transcript history
    enumerateAudioInputs();
    loadTurns();

    // ---- Autostart from Preflight (uses prepared streams) ----
    (async () => {
      const wants = state?.autostart || {};
      try {
        if (wants.mic && mediaBus.micStream) {
          await startMic(null, mediaBus.takeMicStream()); // prepared mic
        }
        if (wants.tab && mediaBus.tabStream) {
          await startTab(mediaBus.takeTabStream());       // prepared tab (Meet)
        }
      } catch (e) {
        console.warn("Autostart failed:", e);
      }
    })();

    return () => {
      document.getElementById("v_validate")?.removeEventListener("click", onValidate);
      document.getElementById("getQs")?.removeEventListener("click", getQsHandler);
      document.getElementById("moreQs")?.removeEventListener("click", moreQsHandler);
      document.getElementById("aiSummary")?.removeEventListener("click", onSummary);
      document.getElementById("loadTurns")?.removeEventListener("click", loadTurnsHandler);

      micBody?.removeEventListener("click", micBodyHandler);
      micCaret?.removeEventListener("click", micCaretHandler);
      micBtn?.removeEventListener("click", micButtonFallbackHandler);
      tabBtn?.removeEventListener("click", tabClickHandler);
      stopBtn?.removeEventListener("click", stopClickHandler);

      try { navigator.mediaDevices?.removeEventListener?.("devicechange", enumerateAudioInputs); } catch {}
      // Ensure everything is torn down (including PiP + Meet tab)
      stopAll();
      document.body.classList.remove("interview-room-body");
    };
  }, [state]);

  const IconMic = (p) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z"/><path d="M5 11a1 1 0 1 0-2 0 9 9 0 0 0 8 8v3h2v-3a9 9 0 0 0 8-8 1 1 0 1 0-2 0 7 7 0 0 1-14 0z"/></svg>);
  const IconChevronDown = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>);
  const IconMonitor = (p) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6v2h3v2H8v-2h3v-2H5a2 2 0 0 1-2-2V5z"/></svg>);
  const IconExit = (p) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3z"/><path d="M15.59 7.41 14.17 8.83 16.34 11H9v2h7.34l-2.17 2.17 1.42 1.42L21 12l-5.41-4.59z"/></svg>);

  return (
    <div className="ir-wrap">
      <style>{styles}</style>

      <header className="ir-header">
        <div className="ir-row" style={{ width: "100%" }}>
          <button id="startMic" className="ir-btn icon micbtn" title="Share your microphone" aria-expanded="false">
            <span className="split">
              <span id="micBody" className="body">
                <span className="ir-icon mic"><IconMic /></span>
                <span id="micLabel" className="label">Share Your Audio</span>
              </span>
              <span id="micCaret" className="caret" aria-haspopup="menu"><IconChevronDown /></span>
            </span>
            <div id="micMenu" className="ir-menu" role="menu" aria-label="Select microphone"></div>
          </button>

          <button id="startTab" className="ir-btn icon secondary tabbtn" title="Capture Meet tab audio">
            <span className="ir-icon monitor"><IconMonitor /></span>
            <span className="label">Simulated Interviewer Audio</span>
          </button>

          <button id="stop" className="ir-btn icon danger" title="Exit interview session">
            <span className="ir-icon"><IconExit /></span>
            <span className="label">Exit</span>
          </button>

          <button id="getQs" className="ir-btn secondary" style={{ marginLeft: "auto" }}>
            AI Questions
          </button>
          <button id="moreQs" className="ir-btn secondary">View more</button>
          <button id="loadTurns" className="ir-btn secondary">Reload History</button>

          <span id="status" className="ir-pill" style={{ marginLeft: 12 }}>idle</span>
        </div>
      </header>

      <main className="ir-main ir-stack">
        <section className="ir-grid">
          <div className="ir-panel">
            <div className="ir-pill" style={{ marginBottom: 8 }}>Transcript</div>
            <div id="interim" className="ir-interim" />
            <div id="finals" className="ra-scroll" style={{ maxHeight: 420, overflow: "auto" }} />
            <div className="ir-tiny">Tip: Send (➤) appears only for <em>interviewer</em> lines.</div>
          </div>

          <div className="ir-panel">
            <div className="ir-pill" style={{ marginBottom: 8 }}>Validation</div>
            <div style={{ marginBottom: 8 }}><strong>Question:</strong> <span id="v_question" /></div>
            <div style={{ marginBottom: 8 }}>
              <strong>Expected Answer</strong>
              <div id="v_expected" style={{ marginTop: 6 }} />
            </div>
            <button id="v_validate" className="ir-btn secondary">Validate</button>
            <div id="v_out" style={{ marginTop: 10 }}>
              <span id="v_verdict" className="ir-badge" />
              <span id="v_score" className="ir-tiny" />
              <div id="v_explain" style={{ marginTop: 6 }} />
              <div id="v_cand" className="ir-tiny" style={{ marginTop: 6 }} />
            </div>
          </div>

          <div className="ir-panel ir-rightbox">
            <div>
              <div className="ir-pill" style={{ marginBottom: 8 }}>AI Suggestions</div>
              <ul id="suggestions" />
            </div>
            <div className="ir-summary-wrap">
              <div className="ir-pill" style={{ marginBottom: 8 }}>Summary (on demand)</div>
              <pre id="aiOut" className="ir-pre" style={{ marginTop: 8 }} />
              <button id="aiSummary" className="ir-btn" style={{ marginTop: 8 }}>Generate Summary</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
