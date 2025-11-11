import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* icons (same as yours) */
const IconChevron=(p)=>(<svg viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M6 8l4 4 4-4"/></svg>);
const IconPause=(p)=>(<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>);
const IconPlay =(p)=>(<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>);
const IconGear =(p)=>(<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.94-3.5a7.87 7.87 0 0 0-.1-1l2.16-1.69-2-3.46-2.63 1a8 8 0 0 0-1.74-1L16.9 1h-3.8l-.73 3.38a8 8 0 0 0-1.74 1l-2.63-1-2 3.46 2.16 1.69a7.87 7.87 0 0 0 0 2L5.3 13.69l2 3.46 2.63-1a8 8 0 0 0 1.74 1L13.1 23h3.8l.73-3.38a8 8 0 0 0 1.74-1l2.63 1 2-3.46-2.16-1.69c.06-.33.1-.66.1-1.01Z"/></svg>);
const IconExit =(p)=>(<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16 13v-2H7V7l-5 5 5 5v-4zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>);
const Pill = ({children}) => (<span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300">{children}</span>);

export default function InterviewRoom() {
  const nav = useNavigate();
  const { state } = useLocation() || {};
  const defaults = {
    sessionId: state?.sessionId || "",
    interviewer: state?.interviewer || "",
    candidate: state?.candidate || "",
    jobTitle: state?.jobTitle || "Software Engineer @ Company",
  };

  const wrapCls = "min-h-screen bg-[#0b0f14] text-slate-100 font-[system-ui] selection:bg-indigo-500/30 selection:text-white";
  const [activeTab, setActiveTab] = useState("copilot"); // "share" | "copilot" | "chatbot" | "cheatsheet"
  const [whoFilter, setWhoFilter] = useState("all");
  const [status, setStatus] = useState("idle");
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(()=>{ pausedRef.current = paused; }, [paused]);

  const [simulated, setSimulated] = useState(false);
  const [devices, setDevices] = useState({ mics: [], speakers: [] });
  const [selectedMicId, setSelectedMicId] = useState("");

  const BACKEND_HTTP = useMemo(() => window.location.origin, []);
  const BACKEND_WS   = useMemo(() => (location.protocol === "https:" ? "wss://" : "ws://") + location.host, []);
  const $ = (id) => document.getElementById(id);

  /* ===== AudioWorklet + downsample helpers ===== */
  const VAD_THRESH = 0.0025;
  const rms = (f)=>{ let s=0; for (let i=0;i<f.length;i++) s+=f[i]*f[i]; return Math.sqrt(s/f.length); };
  const CHUNK_MS = 100;
  const SILENCE_100MS = useMemo(()=> new Uint8Array(new Int16Array((16000*CHUNK_MS)/1000).buffer), []);
  function downsampleFloat32ToInt16(float32, inRate, outRate=16000){
    const ratio=inRate/outRate, newLen=Math.floor(float32.length/ratio);
    const out = new Int16Array(newLen);
    let o=0,i=0;
    while(o<newLen){
      const next=Math.round((o+1)*ratio);
      let acc=0,cnt=0;
      while(i<next && i<float32.length){ acc+=float32[i++]; cnt++; }
      const sample=Math.max(-1,Math.min(1, acc/(cnt||1)));
      out[o++] = sample<0 ? sample*0x8000 : sample*0x7fff;
    }
    return out;
  }

  /* ===== Stable refs for all streaming state (critical fix) ===== */
  const acMicRef   = useRef(null);
  const acTabRef   = useRef(null);
  const micLoaded  = useRef(false);
  const tabLoaded  = useRef(false);

  const wsMicRef   = useRef(null);
  const wsTabRef   = useRef(null);
  const sendMicRef = useRef(null);
  const sendTabRef = useRef(null);

  const bufMicRef  = useRef([]);     // Int16Array chunks
  const lenMicRef  = useRef(0);
  const bufTabRef  = useRef([]);
  const lenTabRef  = useRef(0);

  const streamMicRef = useRef(null);
  const streamTabRef = useRef(null);

  /* ===== Utilities ===== */
  async function postJSON(url, body){
    const r=await fetch(url,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    if(!r.ok) throw new Error(await r.text());
    return r.json();
  }
  async function ensureSession(){
    const sessionEl=$("session"), interviewerEl=$("interviewer"), candidateEl=$("candidate"),
          jdEl=$("jd"), resumeEl=$("resume");
    const sessionId = sessionEl.value.trim() || `MEET-${Math.random().toString(36).slice(2,9)}`;
    sessionEl.value = sessionId;
    await postJSON(`${BACKEND_HTTP}/session/start`,{
      meeting_id: sessionId,
      jd: jdEl?.value || "",
      resume: resumeEl?.value || "",
      interviewer_name: interviewerEl?.value || "",
      candidate_name: candidateEl?.value || "",
    });
    return sessionId;
  }

  function openWS(source, sessionId, speaker, speakerName){
    const qs = `session_id=${encodeURIComponent(sessionId)}&speaker=${encodeURIComponent(speaker)}&speaker_name=${encodeURIComponent(speakerName)}`;
    const ws = new WebSocket(`${BACKEND_WS}/ws/${source}?${qs}`);
    ws.binaryType = "arraybuffer";
    ws.onopen   = ()=> { setStatus(`ws connected (${source})`); console.log(`[ws:${source}] open`); };
    ws.onclose  = (e)=> { setStatus(`ws closed (${source})`); console.log(`[ws:${source}] close`, e.code, e.reason); };
    ws.onerror  = (e)=> { setStatus(`ws error (${source})`);  console.error(`[ws:${source}] error`, e); };
    ws.onmessage = (evt)=>{
      try{
        const msg=JSON.parse(evt.data);
        if(msg.text && msg.text.startsWith("[backend]")) return;
        if(msg.text && msg.final){
          addFinalLine(msg.speaker_name||msg.speaker||msg.source, msg.text, msg.speaker==="interviewer");
          $("interim").textContent = "";
        }else if(msg.text){
          const who = msg.speaker_name||msg.speaker||msg.source;
          $("interim").textContent = `${who}: ${msg.text} …`;
        }
      }catch{}
    };
    return ws;
  }

  function addFinalLine(who, text, isInterviewer){
    const finals = $("finals");
    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2";
    wrap.dataset.who = isInterviewer ? "interviewer" : "candidate";

    const t = document.createElement("div");
    t.className = "text-sm";
    const span = document.createElement("span");
    span.className = "mr-2 font-semibold text-sky-300";
    span.textContent = who + ":";
    t.appendChild(span); t.appendChild(document.createTextNode(" " + text));
    wrap.appendChild(t);

    if(isInterviewer){
      const btn=document.createElement("button");
      btn.className="ml-auto rounded-md border border-slate-600 bg-slate-800/80 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700";
      btn.textContent="➤ Send";
      btn.onclick=async ()=>{
        $("v_question").textContent = text;
        $("v_expected").textContent = "…";
        $("v_verdict").textContent=""; $("v_score").textContent="";
        $("v_explain").textContent=""; $("v_cand").textContent="";
        try{
          const data=await postJSON(`${BACKEND_HTTP}/ai/expected`,{ session_id:$("session").value.trim(), question:text });
          $("v_expected").textContent = data.expected_answer || "";
        }catch(e){ $("v_expected").textContent = "Error: " + e.message; }
      };
      wrap.appendChild(btn);
    }
    finals.appendChild(wrap);
    finals.scrollTop = finals.scrollHeight;
    applyWhoFilter(whoFilter);
  }

  function startSender(which){
    const every = CHUNK_MS;
    if(which==="mic"){
      if (sendMicRef.current) return;
      sendMicRef.current = setInterval(()=>{
        const ws = wsMicRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN || pausedRef.current) return;
        const len = lenMicRef.current;
        if (len===0){ ws.send(SILENCE_100MS); return; }
        const all = new Int16Array(len);
        let off=0; for(const c of bufMicRef.current){ all.set(c, off); off+=c.length; }
        bufMicRef.current = []; lenMicRef.current = 0;
        ws.send(new Uint8Array(all.buffer));
      }, every);
    }else{
      if (sendTabRef.current) return;
      sendTabRef.current = setInterval(()=>{
        const ws = wsTabRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN || pausedRef.current) return;
        const len = lenTabRef.current;
        if (len===0){ ws.send(SILENCE_100MS); return; }
        const all = new Int16Array(len);
        let off=0; for(const c of bufTabRef.current){ all.set(c, off); off+=c.length; }
        bufTabRef.current = []; lenTabRef.current = 0;
        ws.send(new Uint8Array(all.buffer));
      }, every);
    }
  }

  /* ===== MIC ===== */
  async function startMic(deviceId=""){
    if (wsMicRef.current && wsMicRef.current.readyState===WebSocket.OPEN) { setStatus("mic already running"); return; }
    const sessionId = await ensureSession();
    const interviewer = $("interviewer").value.trim() || "Interviewer";

    if (!acMicRef.current) acMicRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    if (!micLoaded.current){
      await acMicRef.current.audioWorklet.addModule("/static/mic-worklet.js");
      micLoaded.current = true;
    }

    streamMicRef.current = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation:true, noiseSuppression:true, ...(deviceId?{ deviceId:{ exact: deviceId } }:{}) },
      video: false,
    });
    const src = acMicRef.current.createMediaStreamSource(streamMicRef.current);
    const node = new AudioWorkletNode(acMicRef.current, "mic-processor", { numberOfInputs: 1, numberOfOutputs: 0 });
    node.port.onmessage = (ev)=>{
      const frame = ev.data;
      if (rms(frame) < VAD_THRESH) return;
      const i16 = downsampleFloat32ToInt16(frame, acMicRef.current.sampleRate, 16000);
      bufMicRef.current.push(i16);
      lenMicRef.current += i16.length;
    };
    src.connect(node);

    wsMicRef.current = openWS("mic", sessionId, "interviewer", interviewer);
    startSender("mic");
    setStatus("recording (mic) …");
  }
  function stopMic(){
    if(sendMicRef.current){ clearInterval(sendMicRef.current); sendMicRef.current=null; }
    if(wsMicRef.current){ try{ wsMicRef.current.close(); }catch{} wsMicRef.current=null; }
    try{
      if(streamMicRef.current){ streamMicRef.current.getTracks().forEach(t=>t.stop()); streamMicRef.current=null; }
    }catch{}
    bufMicRef.current = []; lenMicRef.current = 0;
  }

  /* ===== TAB (Google Meet/tab audio) ===== */
  async function startTab(){
    if (wsTabRef.current && wsTabRef.current.readyState===WebSocket.OPEN) { setStatus("tab already running"); return; }
    const sessionId = await ensureSession();
    const candidate  = $("candidate").value.trim() || "Candidate";

    if (!acTabRef.current) acTabRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    if (!tabLoaded.current){
      await acTabRef.current.audioWorklet.addModule("/static/mic-worklet.js");
      tabLoaded.current = true;
    }

    // Pick Meet tab and tick "Share tab audio"
    streamTabRef.current = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });

    // Ensure an audio track exists (user might forget to tick "share audio")
    const audioTracks = streamTabRef.current.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0){
      setStatus("no audio track in tab stream (tick “Share tab audio”)");
      console.warn("No audio track in display media; select a **tab** and tick 'Share tab audio'.");
    }

    try{
      streamTabRef.current.getTracks().forEach(t => t.addEventListener("ended", () => stopTab()));
    }catch{}

    const src = acTabRef.current.createMediaStreamSource(streamTabRef.current);
    const node = new AudioWorkletNode(acTabRef.current, "mic-processor", { numberOfInputs: 1, numberOfOutputs: 0 });
    node.port.onmessage = (ev)=>{
      const frame = ev.data;
      if (rms(frame) < VAD_THRESH) return;
      const i16 = downsampleFloat32ToInt16(frame, acTabRef.current.sampleRate, 16000);
      bufTabRef.current.push(i16);
      lenTabRef.current += i16.length;
    };
    src.connect(node);

    wsTabRef.current = openWS("tab", sessionId, "candidate", candidate);
    startSender("tab");
    setStatus("recording (tab) …");
  }
  function stopTab(){
    if(sendTabRef.current){ clearInterval(sendTabRef.current); sendTabRef.current=null; }
    if(wsTabRef.current){ try{ wsTabRef.current.close(); }catch{} wsTabRef.current=null; }
    try{
      if(streamTabRef.current){ streamTabRef.current.getTracks().forEach(t=>t.stop()); streamTabRef.current=null; }
    }catch{}
    bufTabRef.current = []; lenTabRef.current = 0;
  }

  function stopAll(){ stopMic(); stopTab(); setStatus("stopped"); }

  /* ===== devices ===== */
  async function refreshDevices(){
    try{
      // prompt once so device labels are populated
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).catch(()=>{});
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        mics: list.filter(d=>d.kind==="audioinput"),
        speakers: list.filter(d=>d.kind==="audiooutput"),
      });
    }catch(e){ console.warn("enumerateDevices failed", e); }
  }
  useEffect(()=>{ refreshDevices(); }, []);

  /* ===== demo lines ===== */
  useEffect(()=>{
    if(!simulated) return;
    const lines = [
      "Good afternoon, thanks for joining us.",
      "Tell me about your work on infotainment middleware.",
      "How would you design a low-latency audio pipeline?",
    ];
    let i=0; const t=setInterval(()=>{ addFinalLine("Interviewer (sim)", lines[i%lines.length], true); i++; }, 2500);
    return ()=>clearInterval(t);
  },[simulated]); // eslint-disable-line

  /* ===== prefill ===== */
  useEffect(()=>{
    $("session").value = defaults.sessionId || "";
    $("interviewer").value = defaults.interviewer || "";
    $("candidate").value = defaults.candidate || "";
  },[]);

  /* ===== filter transcript ===== */
  function applyWhoFilter(filter){
    const finals = $("finals");
    if (!finals) return;
    [...finals.children].forEach(ch => {
      const who = ch.dataset.who || "all";
      ch.style.display = (filter==="all" || filter===who) ? "" : "none";
    });
  }
  useEffect(()=>{ applyWhoFilter(whoFilter); }, [whoFilter]);

  /* ===== UI (unchanged, including Share Audio tab & 3-column Copilot) ===== */
  // --- snip: keep your existing JSX exactly as you had it in the last message ---
  // For brevity, reuse your previous JSX (tabs, Share Audio controls, Copilot 3 columns, etc.)
  // Replace the handler props to call startMic/startTab/stopAll and refreshDevices where you already wired them.
  // (If you want I can paste the full JSX again, but logic above is the only part that changed.)
  // --------------------------------------------------------------------------------

  /* Minimal JSX so this snippet compiles; swap in your full layout from previous message */
  return (
    <div className={wrapCls}>
      <header className="flex items-center gap-3 border-b border-slate-800 px-4 py-2">
        <strong className="text-sm sm:text-base">{defaults.jobTitle}</strong>
        <span className="ml-auto mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs">15</span>
        <button onClick={()=>setPaused(p=>!p)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 hover:bg-slate-800">{paused?<IconPlay className="h-4 w-4"/>:<IconPause className="h-4 w-4"/>}</button>
        <button className="rounded-lg border border-slate-700 bg-slate-900 p-2 hover:bg-slate-800"><IconGear className="h-4 w-4"/></button>
        <button onClick={()=>{ stopAll(); nav(-1); }} className="rounded-lg border border-slate-700 bg-slate-900 p-2 hover:bg-slate-800"><IconExit className="h-4 w-4"/></button>
        <Pill>{status}</Pill>
      </header>

      {/* Share Audio controls (simplified; keep your full tabbed UI) */}
      <main className="mx-auto max-w-[1100px] px-3 py-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="grid grid-cols-[auto,1fr] items-center gap-2 text-xs">
                <label htmlFor="session" className="text-slate-400">Session</label>
                <input id="session" className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1" placeholder="MEET-xyz" defaultValue={defaults.sessionId}/>
                <label htmlFor="interviewer" className="text-slate-400">Interviewer</label>
                <input id="interviewer" className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Your name" defaultValue={defaults.interviewer}/>
                <label htmlFor="candidate" className="text-slate-400">Candidate</label>
                <input id="candidate" className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1" placeholder="Candidate name" defaultValue={defaults.candidate}/>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-slate-300">Share Audio</div>
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={()=>startMic("")} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500">Use default mic</button>
                <details className="relative">
                  <summary className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
                    Pick device <IconChevron className="h-4 w-4" />
                  </summary>
                  <div className="absolute z-20 mt-1 w-[20rem] max-w-[80vw] rounded-lg border border-slate-700 bg-slate-900 p-1 text-sm shadow-xl">
                    <div className="max-h-48 overflow-auto ra-scroll">
                      {devices.mics.map(d=>(
                        <button key={d.deviceId} onClick={()=>{ setSelectedMicId(d.deviceId); startMic(d.deviceId); }} className="block w-full truncate rounded-md px-2 py-1 text-left hover:bg-slate-800" title={d.label || d.deviceId}>
                          {d.label || d.deviceId}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 border-t border-slate-700" />
                    <button onClick={refreshDevices} className="block w-full rounded-md px-2 py-1 text-left hover:bg-slate-800">Refresh devices</button>
                  </div>
                </details>
                <button onClick={startTab} className="rounded-md bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">Share Google Meet tab audio</button>
                <button onClick={stopAll} className="rounded-md border border-rose-600 bg-rose-800/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-800/60">Stop</button>
              </div>
              <div className="text-[11px] text-slate-400">Tip: In the picker, select your **Meet tab** and tick <em>Share tab audio</em>.</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-2">
            <div id="interim" className="min-h-[22px] text-sm italic text-slate-300" />
            <div id="finals" className="ra-scroll mt-2 max-h-[320px] overflow-auto pr-1" />
          </div>
        </div>
      </main>
    </div>
  );
}
