
// ───────── capture: render(t) → WebCodecs H.264 → mp4 → download ─────────
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
window.CAPTURE = async (from, to, fps = 24, name = 'hook.mp4', sub = 1) => {
  const comp = document.createElement('canvas'); comp.width = W; comp.height = H; const cx = comp.getContext('2d');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: 'avc', width: W, height: H, frameRate: fps }, fastStart: 'in-memory' });
  const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { window.CAPERR = String(e); } });
  enc.configure({ codec: 'avc1.640033', width: W, height: H, bitrate: 40e6, framerate: fps, latencyMode: 'quality' });
  window.PROG = { from, to, f: from, t0: performance.now() };
  for (let f = from; f < to; f++) {
    if (sub > 1) { // motion blur: average sub-frames across a 180° shutter
      cx.clearRect(0, 0, W, H); cx.globalAlpha = 1;
      for (let s = 0; s < sub; s++) { window.render((f + (s / sub - .5) * .5) / fps); cx.globalAlpha = 1 / (s + 1); cx.drawImage(glc, 0, 0, W, H); }
      cx.globalAlpha = 1; window.render(f / fps); cx.clearRect(0, 0, 0, 0);
      // overlay only the HUD from the centre sub-frame
      cx.drawImage(hud, 0, 0);
    } else { window.render(f / fps); cx.clearRect(0, 0, W, H); cx.drawImage(glc, 0, 0, W, H); cx.drawImage(hud, 0, 0); }
    const vf = new VideoFrame(comp, { timestamp: Math.round((f - from) * 1e6 / fps), duration: Math.round(1e6 / fps) });
    enc.encode(vf, { keyFrame: (f - from) % 48 === 0 }); vf.close();
    if (enc.encodeQueueSize > 8) await new Promise(r => enc.addEventListener('dequeue', r, { once: true }));
    window.PROG.f = f + 1;
    if (f % 6 === 0) await new Promise(r => setTimeout(r, 0));
  }
  await enc.flush(); muxer.finalize();
  const blob = new Blob([target.buffer], { type: 'video/mp4' }); window.LASTBLOB = blob;
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  window.PROG.done = true; window.PROG.bytes = blob.size; window.PROG.sec = (performance.now() - window.PROG.t0) / 1000;
};
