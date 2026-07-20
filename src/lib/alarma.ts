let ctx: AudioContext | null = null;

/** Tono generado con Web Audio (sin archivos externos). */
export function reproducirBeep() {
  try {
    if (!ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Navegador sin soporte de Web Audio: no truena la app, solo no suena.
  }
}

export function vibrar() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([300, 100, 300]);
  }
}
