// src/lib/mediaBus.js
let _mic = null;
let _tab = null;

// Track the Meet window we open (so we can close it on Exit)
let _meetWindow = null;

// --- PiP helpers ---
let __pipVideo = null;

export function getOrCreatePipVideo() {
  if (__pipVideo) return __pipVideo;
  __pipVideo = document.createElement("video");
  __pipVideo.muted = true;
  __pipVideo.playsInline = true;
  __pipVideo.autoplay = true;
  Object.assign(__pipVideo.style, {
    position: "fixed", left: "-9999px", top: "-9999px",
    width: "1px", height: "1px", opacity: "0", pointerEvents: "none",
  });
  document.body.appendChild(__pipVideo);
  return __pipVideo;
}

export async function pipFromStream(stream) {
  const v = getOrCreatePipVideo();
  if (v.srcObject !== stream) v.srcObject = stream;
  try { await v.play(); } catch {}
  if (document.pictureInPictureElement && document.pictureInPictureElement !== v) {
    try { await document.exitPictureInPicture(); } catch {}
  }
  if (!v.requestPictureInPicture) {
    throw new Error("Picture-in-Picture not supported in this browser.");
  }
  return v.requestPictureInPicture();
}

export async function stopPiP() {
  if (document.pictureInPictureElement) {
    try { await document.exitPictureInPicture(); } catch {}
  }
}

const mediaBus = {
  // Streams hand-off
  setMicStream(s) { _mic = s; },
  takeMicStream() { const s = _mic; _mic = null; return s; },
  get micStream() { return _mic; },

  setTabStream(s) { _tab = s; },
  takeTabStream() { const s = _tab; _tab = null; return s; },
  get tabStream() { return _tab; },

  // Meet window handle (only closable if we opened it)
  setMeetWindow(win) { _meetWindow = win || null; },
  getMeetWindow() {
    return _meetWindow && !_meetWindow.closed ? _meetWindow : null;
  },
  closeMeetWindow() {
    const w = this.getMeetWindow();
    if (w) { try { w.close(); } catch {} }
    _meetWindow = null;
  },
};

export default mediaBus;
