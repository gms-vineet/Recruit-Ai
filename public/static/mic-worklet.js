/* 48k mono Float32 frames -> post back to main thread */
class MicProcessor extends AudioWorkletProcessor {
  process(inputs/*[chans][frames]*/) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    // Make a copy so GC won't reuse backing buffer
    const f32 = new Float32Array(input[0].length);
    f32.set(input[0]);
    this.port.postMessage(f32);
    return true;
  }
}
registerProcessor('mic-processor', MicProcessor);
