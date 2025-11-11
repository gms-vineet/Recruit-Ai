import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const styles = `
:root { --bg:#0b0f14; --fg:#e6edf3; --muted:#9aa3ac; --chip:#1f2937; }
body.interview-room-body { background:var(--bg); } /* scoped body class */
.ir-wrap { color:var(--fg); font:15px/1.45 system-ui, sans-serif; }
.ir-header { padding:16px 20px; border-bottom:1px solid #111827; display:flex; gap:12px; align-items:center; }
.ir-main { max-width:1200px; margin:18px auto; padding:0 16px 80px; }
.ir-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
.ir-input, .ir-textarea {
  padding:10px 12px; background:#0f172a; color:var(--fg);
  border:1px solid #1f2937; border-radius:10px;
}
.ir-textarea { width:100%; min-height:90px; resize:vertical; }
.ir-btn { padding:10px 14px; border-radius:10px; background:#2563eb; color:white; border:none; cursor:pointer; }
.ir-btn.secondary { background:#374151; }
.ir-pill { background:var(--chip); color:var(--muted); border-radius:999px; padding:6px 10px; }
.ir-panel { background:#0f172a; border:1px solid #1f2937; border-radius:14px; padding:14px; }
.ir-interim { color:#cbd5e1; font-style:italic; opacity:.9; min-height:22px; }
.ir-final { margin:6px 0; padding:8px 10px; background:#0b1220; border:1px solid #1f2937; border-radius:10px; display:flex; justify-content:space-between; gap:8px; align-items:center; }
.ir-final .text { flex:1; }
.ir-who { color:#93c5fd; margin-right:8px; font-weight:600; }
.ir-sendbtn { background:#1f2937; border:1px solid #334155; color:#d1d5db; border-radius:8px; padding:6px 10px; cursor:pointer; display:flex; align-items:center; gap:6px; }
.ir-sendbtn:hover { background:#2a3648; }
.ir-grid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; }
.ir-stack { display:flex; flex-direction:column; gap:8px; }
.ir-pre { white-space:pre-wrap; }
.ir-tiny { font-size:12px; color:#9aa3ac; }
.ir-badge { padding:2px 6px; border-radius:6px; font-size:12px; }
.ir-ok { background:#064e3b; color:#a7f3d0; }
.ir-warn { background:#4f46e5; color:#e0e7ff; }
.ir-bad { background:#7f1d1d; color:#fecaca; }
.ir-rightbox { display:flex; flex-direction:column; gap:10px; position:relative; }
.ir-summary-wrap { margin-top:auto; }
`;

export default function InterviewRoom() {
  const { state } = useLocation() || {};
  const defaults = {
    sessionId: state?.sessionId || "",
    interviewer: state?.interviewer || "",
    candidate: state?.candidate || "",
  };

  useEffect(() => {
    // Give body a scoped background (so it doesn’t affect the rest of the app)
    document.body.classList.add("interview-room-body");

    const BACKEND_HTTP = window.location.origin;
    const BACKEND_WS =
      (window.location.protocol === "https:" ? "wss://" : "ws://") +
      window.location.host;

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

    // 48k Float32 -> 16k Int16 LINEAR16
    function downsampleFloat32ToInt16(float32, inRate, outRate = 16000) {
      const ratio = inRate / outRate;
      const newLen = Math.floor(float32.length / ratio);
      const out = new Int16Array(newLen);
      let o = 0, i = 0;
      while (o < newLen) {
        const next = Math.round((o + 1) * ratio);
        let acc = 0, cnt = 0;
        while (i < next && i < float32.length) {
          acc += float32[i++]; cnt++;
        }
        const sample = Math.max(-1, Math.min(1, acc / (cnt || 1)));
        out[o++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      return out;
    }

    // keep-alive to avoid STT timeout on silence
    const CHUNK_MS = 100;
    const SILENCE_100MS = new Uint8Array(
      new Int16Array((16000 * CHUNK_MS) / 1000).buffer
    );

    // split state for mic and tab
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

    const sessionEl = $("session");
    const interviewerEl = $("interviewer");
    const candidateEl = $("candidate");
    const jdEl = $("jd");
    const resumeEl = $("resume");

    const vQ = $("v_question");
    const vE = $("v_expected");
    const vVerd = $("v_verdict");
    const vScore = $("v_score");
    const vExplain = $("v_explain");
    const vCand = $("v_cand");

    const suggUL = $("suggestions");
    const aiOut = $("aiOut");

    const setStatus = (t) => (statusEl.textContent = t);

    // ---------- NEW: Prompt mic permission on page load ----------
    async function prewarmMicPermission() {
      // Avoid double-prompt in React StrictMode (dev) by using a window flag
      if (window.__ir_mic_preprompt_done) return;
      window.__ir_mic_preprompt_done = true;

      if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
        setStatus("mic permission: unsupported");
        return;
      }
      // Helpful status when not in a secure context
      if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
      ) {
        setStatus("use HTTPS or localhost for mic");
      }

      try {
        // If Permissions API is available, surface quick status
        if (navigator.permissions?.query) {
          try {
            const perm = await navigator.permissions.query({ name: "microphone" });
            if (perm.state === "granted") {
              setStatus("mic permission: granted");
              return;
            }
            if (perm.state === "denied") {
              setStatus("mic permission: denied");
              return;
            }
            // If "prompt", we’ll trigger the real prompt below
          } catch {}
        }
        // Trigger the actual browser prompt; immediately release tracks
        const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
        tmp.getTracks().forEach((t) => t.stop());
        setStatus("mic permission: granted");
      } catch (err) {
        // Common names: NotAllowedError (blocked/cancelled), NotFoundError (no mic)
        setStatus("mic permission: " + (err?.name || "error"));
      }
    }
    // Give the header a tick to paint before prompting
    setTimeout(prewarmMicPermission, 150);
    // -------------------------------------------------------------

    async function ensureSession() {
      const sessionId =
        sessionEl.value.trim() ||
        `MEET-${Math.random().toString(36).slice(2, 9)}`;
      sessionEl.value = sessionId;
      const body = {
        meeting_id: sessionId,
        jd: jdEl.value || "",
        resume: resumeEl.value || "",
        interviewer_name: interviewerEl.value || "",
        candidate_name: candidateEl.value || "",
      };
      const r = await fetch(`${BACKEND_HTTP}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      return sessionId;
    }

    function addSendButton(div, who, text) {
      const interviewer = interviewerEl.value.trim() || "Interviewer";
      if (who !== interviewer) return;

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
            session_id: sessionEl.value.trim(),
            question: text,
          });
          vE.textContent = data.expected_answer || "";
        } catch (e) {
          vE.textContent = "Error: " + e.message;
        }
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
      const qs = `session_id=${encodeURIComponent(
        sessionId
      )}&speaker=${encodeURIComponent(
        speaker
      )}&speaker_name=${encodeURIComponent(speakerName)}`;
      const wss = new WebSocket(`${BACKEND_WS}/ws/${source}?${qs}`);
      wss.binaryType = "arraybuffer";
      wss.onopen = () => setStatus(`ws connected (${source})`);
      wss.onclose = () => setStatus(`ws closed (${source})`);
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

    // ===== MIC =====
    async function startMic() {
      if (wsMic && wsMic.readyState === WebSocket.OPEN) {
        setStatus("mic already running");
        return;
      }
      const sessionId = await ensureSession();
      const interviewer = interviewerEl.value.trim() || "Interviewer";

      if (!acMic)
        acMic = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000,
        });
      if (!micModuleLoaded) {
        await acMic.audioWorklet.addModule("/static/mic-worklet.js");
        micModuleLoaded = true;
      }

      try {
        streamMic = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        });
      } catch (e) {
        setStatus(e?.name === "NotAllowedError" ? "mic blocked" : "mic failed");
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

      wsMic = openWS("mic", sessionId, "interviewer", interviewer);
      startSender("mic");
      setStatus("recording (mic)…");
    }

    function stopMic() {
      if (sendTimerMic) {
        clearInterval(sendTimerMic);
        sendTimerMic = null;
      }
      if (wsMic) {
        try { wsMic.close(); } catch {}
        wsMic = null;
      }
      if (nodeMic) {
        try { nodeMic.disconnect(); } catch {}
        nodeMic = null;
      }
      if (streamMic) {
        try { streamMic.getTracks().forEach((t) => t.stop()); } catch {}
        streamMic = null;
      }
      bufMic = [];
      lenMic = 0;
    }

    // ===== TAB =====
    async function startTab() {
      if (wsTab && wsTab.readyState === WebSocket.OPEN) {
        setStatus("tab already running");
        return;
      }
      const sessionId = await ensureSession();
      const candidate = candidateEl.value.trim() || "Candidate";

      if (!acTab)
        acTab = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 48000,
        });
      if (!tabModuleLoaded) {
        await acTab.audioWorklet.addModule("/static/mic-worklet.js");
        tabModuleLoaded = true;
      }

      // Select Meet tab and tick “Share tab audio”
      try {
        streamTab = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } catch (e) {
        setStatus(e?.name === "NotAllowedError" ? "tab share cancelled" : "tab share failed");
        return;
      }

      try {
        streamTab.getTracks().forEach((t) => t.addEventListener("ended", () => stopTab()));
      } catch {}

      const src = acTab.createMediaStreamSource(streamTab);

      const node = new AudioWorkletNode(acTab, "mic-processor");
      node.port.onmessage = (ev) => {
        const frame = ev.data;
        if (rms(frame) < VAD_THRESH) return; // noise gate for tab
        const i16 = downsampleFloat32ToInt16(frame, acTab.sampleRate, 16000);
        bufTab.push(i16);
        lenTab += i16.length;
      };
      src.connect(node);
      nodeTab = node;

      wsTab = openWS("tab", sessionId, "candidate", candidate);
      startSender("tab");
      setStatus("recording (tab)…");
    }

    function stopTab() {
      if (sendTimerTab) {
        clearInterval(sendTimerTab);
        sendTimerTab = null;
      }
      if (wsTab) {
        try { wsTab.close(); } catch {}
        wsTab = null;
      }
      if (nodeTab) {
        try { nodeTab.disconnect(); } catch {}
        nodeTab = null;
      }
      if (streamTab) {
        try { streamTab.getTracks().forEach((t) => t.stop()); } catch {}
        streamTab = null;
      }
      bufTab = [];
      lenTab = 0;
    }

    function stopAll() {
      stopMic();
      stopTab();
      setStatus("stopped");
    }

    async function postJSON(url, body) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }

    // === AI: Validate
    const onValidate = async () => {
      const sessionId = sessionEl.value.trim();
      const q = (vQ.textContent || "").trim();
      if (!sessionId || !q) return alert("Pick a question (send ➤) first");
      vVerd.textContent = "";
      vScore.textContent = "";
      vExplain.textContent = "…";
      vCand.textContent = "";
      try {
        const data = await postJSON(`${BACKEND_HTTP}/ai/validate`, {
          session_id: sessionId,
          question: q,
        });
        vExplain.textContent = data.explanation || "";
        vCand.textContent = data.candidate_answer
          ? `Candidate’s Answer: ${data.candidate_answer}`
          : "";
        vScore.textContent = `Score: ${(data.score * 100).toFixed(0)}%`;
        vVerd.textContent = (data.verdict || "").toUpperCase();
        vVerd.className =
          "ir-badge " +
          (data.verdict === "right"
            ? "ir-ok"
            : data.verdict === "almost"
            ? "ir-warn"
            : "ir-bad");
      } catch (e) {
        vExplain.textContent = "Error: " + e.message;
      }
    };

    // === AI: questions
    async function getQs(append = false) {
      const sessionId = sessionEl.value.trim();
      if (!sessionId) return alert("Set Session ID first");
      try {
        const url = append
          ? `${BACKEND_HTTP}/ai/questions/more`
          : `${BACKEND_HTTP}/ai/questions`;
        const data = await postJSON(url, { session_id: sessionId, count: 5 });
        if (!append) suggUL.innerHTML = "";
        (data.questions || []).forEach((q) => {
          const li = document.createElement("li");
          li.textContent = q;
          suggUL.appendChild(li);
        });
      } catch (e) {
        alert("AI error: " + e.message);
      }
    }

    // === AI: summary
    const onSummary = async () => {
      const sessionId = sessionEl.value.trim();
      if (!sessionId) return alert("Set Session ID first");
      aiOut.textContent = "…";
      try {
        const data = await postJSON(`${BACKEND_HTTP}/ai/summary`, {
          session_id: sessionId,
        });
        aiOut.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        aiOut.textContent = "Error: " + e.message;
      }
    };

    // Bind buttons
    $("v_validate")?.addEventListener("click", onValidate);
    $("getQs")?.addEventListener("click", () => getQs(false));
    $("moreQs")?.addEventListener("click", () => getQs(true));
    $("aiSummary")?.addEventListener("click", onSummary);
    $("startMic")?.addEventListener("click", startMic);
    $("startTab")?.addEventListener("click", startTab);
    $("stop")?.addEventListener("click", stopAll);

    // pre-fill from router state if present
    if (defaults.sessionId) sessionEl.value = defaults.sessionId;
    if (defaults.interviewer) interviewerEl.value = defaults.interviewer;
    if (defaults.candidate) candidateEl.value = defaults.candidate;

    return () => {
      // cleanup (important for React StrictMode dev)
      $("v_validate")?.removeEventListener("click", onValidate);
      $("getQs")?.removeEventListener("click", () => getQs(false));
      $("moreQs")?.removeEventListener("click", () => getQs(true));
      $("aiSummary")?.removeEventListener("click", onSummary);
      $("startMic")?.removeEventListener("click", startMic);
      $("startTab")?.removeEventListener("click", startTab);
      $("stop")?.removeEventListener("click", stopAll);
      stopAll();
      document.body.classList.remove("interview-room-body");
    };
  }, [state]);

  return (
    <div className="ir-wrap">
      <style>{styles}</style>

      <header className="ir-header">
        <strong>Recruiter Meet Bot</strong>
        <span className="ir-pill">Google STT → Supabase → Ollama (manual)</span>
        <span id="status" className="ir-pill" style={{ marginLeft: "auto" }}>
          idle
        </span>
      </header>

      <main className="ir-main ir-stack">
        {/* Session & meta */}
        <section className="ir-panel ir-stack">
          <div className="ir-row">
            <label htmlFor="session">Session ID</label>
            <input
              id="session"
              type="text"
              className="ir-input"
              placeholder="e.g. MEET-abc123"
              defaultValue={defaults.sessionId}
            />
            <label htmlFor="interviewer">Interviewer</label>
            <input
              id="interviewer"
              type="text"
              className="ir-input"
              placeholder="e.g. Yash"
              defaultValue={defaults.interviewer}
            />
            <label htmlFor="candidate">Candidate</label>
            <input
              id="candidate"
              type="text"
              className="ir-input"
              placeholder="e.g. Alex"
              defaultValue={defaults.candidate}
            />
          </div>

          <div className="ir-row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, color: "#9aa3ac" }}>
                Job Description
              </div>
              <textarea
                id="jd"
                className="ir-textarea"
                placeholder="Paste JD here"
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6, color: "#9aa3ac" }}>Resume</div>
              <textarea
                id="resume"
                className="ir-textarea"
                placeholder="Paste candidate resume here"
              />
            </div>
          </div>

          <div className="ir-row">
            <button id="startMic" className="ir-btn">
              Start Mic
            </button>
            <button id="startTab" className="ir-btn secondary">
              Start Tab Audio
            </button>
            <button id="stop" className="ir-btn">
              Stop
            </button>

            <button
              id="getQs"
              className="ir-btn secondary"
              style={{ marginLeft: "auto" }}
            >
              AI Questions
            </button>
            <button id="moreQs" className="ir-btn secondary">
              View more
            </button>
          </div>
        </section>

        {/* 3-column layout */}
        <section className="ir-grid">
          {/* Left: Transcript */}
          <div className="ir-panel">
            <div className="ir-pill" style={{ marginBottom: 8 }}>
              Transcript
            </div>
            <div id="interim" className="ir-interim" />
            <div
              id="finals"
              className="ra-scroll"
              style={{ maxHeight: 420, overflow: "auto" }}
            />
            <div className="ir-tiny">
              Tip: Send (➤) appears only for <em>interviewer</em> lines.
            </div>
          </div>

          {/* Middle: Validation panel */}
          <div className="ir-panel">
            <div className="ir-pill" style={{ marginBottom: 8 }}>
              Validation
            </div>
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

          {/* Right: Suggested questions + summary */}
          <div className="ir-panel ir-rightbox">
            <div>
              <div className="ir-pill" style={{ marginBottom: 8 }}>
                AI Suggestions
              </div>
              <ul id="suggestions" />
            </div>
            <div className="ir-summary-wrap">
              <div className="ir-pill" style={{ marginBottom: 8 }}>
                Summary (on demand)
              </div>
              <pre id="aiOut" className="ir-pre" style={{ marginTop: 8 }} />
              <button id="aiSummary" className="ir-btn" style={{ marginTop: 8 }}>
                Generate Summary
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
