// public/static/mic-worklet.js
class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    // inputs[0][0] is Float32Array of mono samples (128 frames by default)
    const input = inputs[0];
    if (input && input[0] && input[0].length) {
      // Post the raw Float32 frame to the main thread
      this.port.postMessage(input[0]);
    }
    return true; // keep processor alive
  }
}
registerProcessor("mic-processor", MicProcessor);
