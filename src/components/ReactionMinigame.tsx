import React, { useState, useRef } from 'react';

interface Props {
  onClose?: () => void;
  onComplete?: (reactionMs: number) => void;
}

export default function ReactionMinigame({ onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [message, setMessage] = useState('Click start to begin');
  const [reaction, setReaction] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const start = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setReaction(null);
    setPhase('waiting');
    setMessage('Wait for green...');
    const delay = 1000 + Math.floor(Math.random() * 2000);
    timerRef.current = window.setTimeout(() => {
      setPhase('ready');
      setMessage('CLICK!');
      startRef.current = performance.now();
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('idle');
      setMessage('Too soon — try again');
      setReaction(null);
      return;
    }

    if (phase === 'ready' && startRef.current) {
      const now = performance.now();
      const ms = Math.max(0, Math.round(now - startRef.current));
      setReaction(ms);
      setPhase('result');
      setMessage(`Your reaction: ${ms} ms`);
      if (onComplete) onComplete(ms);
      return;
    }
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setMessage('Click start to begin');
    setReaction(null);
  };

  const panelClass = () => {
    if (phase === 'waiting' || phase === 'idle') return 'bg-red-200';
    if (phase === 'ready') return 'bg-green-400';
    return 'bg-gray-100';
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold mb-4">Reaction Time</h3>
        <p className="mb-4 text-sm text-gray-600">Test your reaction speed — wait for green, then click as fast as you can.</p>

        <div
          role="button"
          onClick={handleClick}
          className={`w-64 h-40 mx-auto rounded-lg flex items-center justify-center cursor-pointer select-none mb-4 transition-colors ${panelClass()}`}
        >
          <span className="text-xl font-semibold">{message}</span>
        </div>

        {reaction !== null && (
          <div className="mb-4">
            <div className="text-lg">{reaction} ms</div>
            <div className="text-sm text-gray-500">Lower is better</div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={start}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
