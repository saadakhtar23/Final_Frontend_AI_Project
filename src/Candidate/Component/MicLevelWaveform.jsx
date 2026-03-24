import React, { useEffect, useRef } from 'react';

/** Baseline pattern (px); bars grow from here when sound is detected */
const baseHeights = [
  24, 16, 20, 14, 28, 18, 26, 22,
  16, 24, 20, 30, 18, 22, 16, 26,
  20, 14, 28, 18, 24, 22, 16, 26,
  20, 30, 18, 22, 16, 24, 20, 26,
];

const MAX_BAR_HEIGHT = 70;
const BAR_COUNT = baseHeights.length;

/** Larger FFT = more samples for stable RMS; voice shows up in waveform, not tiny FFT bins */
const FFT_SIZE = 1024;
/** How much RMS (0–1) maps into extra height */
const RMS_TO_PX = 480;

function resetBarsToBase(barsRef) {
  baseHeights.forEach((h, i) => {
    const bar = barsRef.current[i];
    if (bar) bar.style.height = `${h}px`;
  });
}

/**
 * Horizontal row of vertical pills. Uses getByteTimeDomainData + per-segment RMS
 * so speech (“hello”, etc.) moves bars reliably (frequency-only fftSize=64 was too weak for voice).
 */
export default function MicLevelWaveform({ stream }) {
  const barsRef = useRef([]);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const smoothedRef = useRef(baseHeights.map((h) => h));

  useEffect(() => {
    smoothedRef.current = baseHeights.map((h) => h);

    const tracks =
      stream && typeof stream.getAudioTracks === 'function' ? stream.getAudioTracks() : [];
    tracks.forEach((t) => {
      try {
        t.enabled = true;
      } catch (e) {}
    });
    const live = tracks.some((t) => t.readyState === 'live' && t.enabled);

    if (!stream || !live) {
      const id = requestAnimationFrame(() => resetBarsToBase(barsRef));
      return () => cancelAnimationFrame(id);
    }

    let cancelled = false;

    const start = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (cancelled) return;
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        if (cancelled) return;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);

        analyserRef.current = analyser;
        audioCtxRef.current = audioContext;
        sourceRef.current = source;

        const timeData = new Uint8Array(analyser.fftSize);
        const chunk = Math.max(1, Math.floor(timeData.length / BAR_COUNT));
        const sm = smoothedRef.current;

        const update = () => {
          if (cancelled || !analyserRef.current) return;

          const ctx = audioCtxRef.current;
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }

          analyserRef.current.getByteTimeDomainData(timeData);

          for (let i = 0; i < BAR_COUNT; i++) {
            const bar = barsRef.current[i];
            if (!bar) continue;

            const startIdx = i * chunk;
            const endIdx = Math.min(startIdx + chunk, timeData.length);
            let sumSq = 0;
            let count = 0;
            for (let j = startIdx; j < endIdx; j++) {
              const centered = (timeData[j] - 128) / 128;
              sumSq += centered * centered;
              count++;
            }
            const rms = count ? Math.sqrt(sumSq / count) : 0;

            const rawTarget = Math.min(
              baseHeights[i] + rms * RMS_TO_PX,
              MAX_BAR_HEIGHT
            );
            sm[i] = sm[i] * 0.35 + rawTarget * 0.65;
            bar.style.height = `${sm[i]}px`;
          }

          rafRef.current = requestAnimationFrame(update);
        };

        update();
      } catch (e) {
        console.warn('MicLevelWaveform: analyser failed', e);
      }
    };

    start();

    const resumeIfSuspended = () => {
      try {
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state === 'suspended') ctx.resume();
      } catch (e) {}
    };
    window.addEventListener('pointerdown', resumeIfSuspended, true);
    window.addEventListener('keydown', resumeIfSuspended, true);

    return () => {
      window.removeEventListener('pointerdown', resumeIfSuspended, true);
      window.removeEventListener('keydown', resumeIfSuspended, true);
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        sourceRef.current?.disconnect();
      } catch (e) {}
      try {
        analyserRef.current?.disconnect();
      } catch (e) {}
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      sourceRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current = null;
      requestAnimationFrame(() => resetBarsToBase(barsRef));
    };
  }, [stream]);

  return (
    <div
      className="mt-3 w-full rounded-xl bg-gray-100 px-2 py-2"
      aria-label="Microphone level"
      role="img"
    >
      <div className="flex h-[76px] w-full min-w-0 flex-row items-end justify-center gap-[5px] overflow-hidden rounded-lg bg-[#f8f9fb]">
        {baseHeights.map((h, i) => (
          <div
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className="w-[4px] shrink-0 rounded-full bg-purple-600"
            style={{
              height: `${h}px`,
              maxHeight: `${MAX_BAR_HEIGHT}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
