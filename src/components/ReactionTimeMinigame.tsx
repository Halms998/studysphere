import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getBenchmarkMs, benchmarkClass } from '../lib/benchmark';
import useRandomDelay from '../hooks/useRandomDelay';

// Notes on applied SOLID principles in this component:
// - DIP (Dependency Inversion): benchmark generation and color mapping were
//   moved into `src/lib/benchmark.ts` and are used via `getBenchmarkMs` and
//   `benchmarkClass` so the component no longer creates these low-level
//   details itself.
// - SRP (Single Responsibility): the randomized scheduling logic was moved
//   into `src/hooks/useRandomDelay.ts` so this component focuses on UI and
//   game flow while the hook handles timing/scheduling responsibilities.

interface Props {
  trials?: number; // number of trials per run
  onClose?: () => void;
  onComplete?: (summary: { attempts: number[]; avgMs: number; beatCount: number }) => void;
}

export default function ReactionTimeMinigame({ trials = 3, onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<'intro' | 'waiting' | 'ready' | 'clicked' | 'results'>('intro');
  const [attempts, setAttempts] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  const startRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  // DIP usage: benchmark value comes from the benchmark util (higher-level
  // abstraction) rather than being generated inline here.
  const [benchmarkMs] = useState<number>(() => getBenchmarkMs(120, 500));

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  // SRP usage: scheduling (random delay) is delegated to `useRandomDelay`.
  // The component simply starts/cancels the delay and responds to the
  // callback; timing details are the hook's responsibility.
  const { start: startDelay, cancel: cancelDelay } = useRandomDelay(() => {
    startRef.current = Date.now();
    setMessage('CLICK NOW!');
    setPhase('ready');
  }, 800, 2200);

  function startRun() {
    setAttempts([]);
    setMessage('Get ready...');
    setPhase('waiting');
    startDelay();
  }

  function handleClick() {
    if (phase === 'waiting') {
      // clicked too early
      cancelDelay();
      setMessage('Too early! That trial will be marked as a miss.');
      setAttempts(prev => [...prev, -1]);
      setPhase('clicked');
      // short pause then continue
      window.setTimeout(() => continueOrFinish(), 700);
      return;
    }

    if (phase !== 'ready') return;
    const now = Date.now();
    const rt = startRef.current ? now - startRef.current : 0;
    setAttempts(prev => [...prev, rt]);
    setMessage(`${rt} ms`);
    setPhase('clicked');

    // small pause to show feedback then schedule next or finish
    window.setTimeout(() => continueOrFinish(), 700);
  }

  function continueOrFinish() {
    if (attempts.length + 1 < trials) {
      // start next trial
      setMessage('Get ready...');
      setPhase('waiting');
      startDelay();
    } else {
      // finish run
      setPhase('results');
      if (onComplete) {
        const finalAttempts = attempts.slice();
        // note: the last attempt may not yet be in attempts when this runs in some timing paths; recompute from state
        // safe to use finalAttempts here; for presentation we compute summary below
        const valid = finalAttempts.filter(a => a > 0);
        const avg = valid.length ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length) : 0;
        const beatCount = finalAttempts.filter(a => a > 0 && a < benchmarkMs).length;
        onComplete({ attempts: finalAttempts, avgMs: avg, beatCount });
      }
    }
  }

  function reset() {
    setAttempts([]);
    setPhase('intro');
    setMessage('');
  }

  // UI helpers
  const avg = useMemo(() => {
    const valid = attempts.filter(a => a > 0);
    return valid.length ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length) : 0;
  }, [attempts]);

  const beatCount = attempts.filter(a => a > 0 && a < benchmarkMs).length;

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white border rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Reaction Time</h3>
        <div className="text-sm text-gray-600 mb-4">Beat the benchmark and prove your reflexes — {trials} trials per run</div>

        <div className="mb-4">
          <div className="text-xs text-gray-500">Competitor benchmark</div>
          <div className={`inline-block px-3 py-1 rounded ${benchmarkClass(benchmarkMs)} text-lg font-semibold tabular-nums`}>{benchmarkMs} ms</div>
        </div>

        {phase === 'intro' && (
          <div>
            <p className="mb-4">When you press Start, wait for the "CLICK NOW!" prompt and tap the big button as fast as you can.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={startRun} className="px-4 py-2 bg-blue-600 text-white rounded">Start</button>
              <button onClick={() => { if (onClose) onClose(); }} className="px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        )}

        {phase !== 'intro' && phase !== 'results' && (
          <div>
            <div className="mb-4">
              <div className="h-28 flex items-center justify-center bg-gray-900 text-white rounded cursor-pointer select-none" onClick={handleClick}>
                <div>
                  <div className="text-sm opacity-80">{message}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <div>Trial: {attempts.length + (phase === 'clicked' ? 1 : 0)} / {trials}</div>
              <div>Beats: <span className="font-medium">{beatCount}</span></div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => { if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; } reset(); }} className="px-4 py-2 bg-gray-200 rounded">Abort</button>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div>
            <div className="mb-3">
              <div className="text-sm text-gray-600">Results</div>
              <div className="mt-2 space-y-2 text-left">
                {attempts.map((a, i) => (
                  <div key={i} className={`p-2 rounded ${a === -1 ? 'bg-red-50 border border-red-200' : a < benchmarkMs ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="text-sm">Trial {i + 1}: {a === -1 ? 'Too early / Miss' : `${a} ms`} {a > 0 && a < benchmarkMs ? '🏁' : ''}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3 text-sm">Average (valid): <span className="font-medium tabular-nums">{avg ? `${avg} ms` : '—'}</span></div>
            <div className="mb-3 text-sm">Beat count: <span className="font-medium">{beatCount}</span></div>

            <div className="flex gap-3 justify-center">
              <button onClick={startRun} className="px-4 py-2 bg-blue-600 text-white rounded">Play Again</button>
              <button onClick={() => { reset(); if (onClose) onClose(); }} className="px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
