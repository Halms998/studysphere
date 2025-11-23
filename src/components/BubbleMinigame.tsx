import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type LocalQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex?: number;
};

type ApiQuestion = {
  id: string;
  question_text: string;
  options: { id: string; option_text: string }[];
};

interface Props {
  onClose?: () => void;
  onComplete?: (score: number) => void;
  questions?: LocalQuestion[];
  count?: number;
  timePerQuestion?: number; // seconds
}

export default function BubbleMinigame({ onClose, onComplete, questions, count = 5, timePerQuestion = 8 }: Props) {
  const sample: LocalQuestion[] = useMemo(
    () => [
      { id: 'b1', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], answerIndex: 1 },
      { id: 'b2', question: 'Solve: x + 3 = 6', options: ['2', '3', '4', '1'], answerIndex: 2 },
      { id: 'b3', question: 'What is the capital of France?', options: ['Paris', 'London', 'Rome', 'Berlin'], answerIndex: 0 },
      { id: 'b4', question: 'Which is a prime number?', options: ['4', '6', '7', '8'], answerIndex: 2 },
      { id: 'b5', question: 'Which tag creates a paragraph in HTML?', options: ['<div>', '<p>', '<span>', '<img>'], answerIndex: 1 },
    ],
    []
  );

  const pool = questions && questions.length > 0 ? questions : sample;

  const [mode, setMode] = useState<'local' | 'api'>(() => (questions && questions.length > 0 ? 'local' : 'api'));
  const [localShuffled, setLocalShuffled] = useState<LocalQuestion[]>(() => shuffle(pool).slice(0, count));
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[] | null>(null);
  const [apiQuizId, setApiQuizId] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bubbleLayout, setBubbleLayout] = useState<{ key: string; left: number; duration: number }[] | null>(null);
  const [localResults, setLocalResults] = useState<any[] | null>(null);
  const [finishedResults, setFinishedResults] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | null>>({}); // api: question_id->option_id
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedAnswersRef = useRef<Record<string, string | null>>({});
  const localResultsRef = useRef<any[]>([]);

  const timeoutRef = useRef<number | null>(null);
  const advanceCalledRef = useRef(false);
  const [apiReloadCounter, setApiReloadCounter] = useState(0);
  const bubbleAreaRef = useRef<HTMLDivElement | null>(null);
  const [confetti, setConfetti] = useState<Array<{ id: string; left: number; top: number; bg: string; delay: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadApi() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setMode('local');
          return;
        }
        setApiQuestions(null);
        const resp = await fetch('/api/quizzes', { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) {
          setMode('local');
          return;
        }
        const quizzes = await resp.json();
        if (!Array.isArray(quizzes) || quizzes.length === 0) {
          setMode('local');
          return;
        }
        const quizId = quizzes[0].id;
        setApiQuizId(quizId);
        const qResp = await fetch(`/api/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!qResp.ok) {
          setMode('local');
          return;
        }
        const payload = await qResp.json();
        const raw: ApiQuestion[] = (payload.questions || []).map((q: any) => ({ id: q.id, question_text: q.question_text, options: (q.options || []).map((o: any) => ({ id: o.id, option_text: o.option_text })) }));
        if (raw.length === 0) {
          setMode('local');
          return;
        }
        // dedupe
        const map: Record<string, ApiQuestion> = {};
        for (const r of raw) map[r.id] = r;
        const unique = Object.values(map);
        if (cancelled) return;
        setApiQuestions(shuffle(unique).slice(0, count));
        setMode('api');
      } catch (e) {
        console.warn('BubbleMinigame: API load failed, using local', e);
        setMode('local');
      }
    }
    if (mode === 'api') loadApi();
    return () => { cancelled = true; };
  }, [mode, count, apiReloadCounter]);

  useEffect(() => {
    // compute layout for this question and then start
    computeLayoutForQuestion();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, apiQuestions, localShuffled]);

  function computeLayoutForQuestion() {
    const opts = mode === 'local' ? (localShuffled[index]?.options || []) : (apiQuestions?.[index]?.options || []).map((o) => o.option_text || '');
    if (!opts || opts.length === 0) {
      setBubbleLayout(null);
      // still start question to allow timeout to fire when question arrives
      startQuestion();
      return;
    }
    const n = opts.length;
    // compute evenly spaced left positions with small jitter but ensure spacing to avoid overlap
    const layout: { key: string; left: number; duration: number }[] = [];
    for (let i = 0; i < n; i++) {
      const base = ((i + 1) / (n + 1)) * 100; // percent
      const jitter = (Math.random() - 0.5) * Math.min(10, 80 / n); // +/- jitter
      const left = Math.max(5, Math.min(95, base + jitter));
      const duration = timePerQuestion + Math.random() * 2;
      layout.push({ key: `${index}-${i}`, left, duration });
    }
    setBubbleLayout(layout);
    // clear any popped/selected visual state for the new question
    setPoppedIndex(null);
    // reset per-question results storage if starting new run
    if (!localResults) setLocalResults([]);
    // start timer after layout set
    startQuestion();
  }

  function startQuestion() {
    // clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    advanceCalledRef.current = false;
    setPoppedIndex(null);
    // only set timeout if question exists
    const has = (mode === 'local' && localShuffled[index]) || (mode === 'api' && apiQuestions && apiQuestions[index]);
    if (!has) return;
    timeoutRef.current = window.setTimeout(() => {
      // time up: treat as incorrect / no answer (guard against double calls)
      try {
        if (advanceCalledRef.current) return;
        // if the user already selected an answer for this question, skip calling advance
        if (mode === 'api') {
          const q = apiQuestions?.[index];
          const already = q && selectedAnswersRef.current && Object.prototype.hasOwnProperty.call(selectedAnswersRef.current, q.id) && selectedAnswersRef.current[q.id] !== undefined;
          if (already) return;
        } else {
          // local mode: check localResultsRef
          if (localResultsRef.current && localResultsRef.current.length > index) return;
        }

        // call advance without pre-setting the guard (advance will set it) so it can run
        advance(null);
      } catch (e) {
        // ignore
      }
    }, timePerQuestion * 1000) as unknown as number;
  }

  function advance(selected: { optionIndex?: number; optionId?: string } | null) {
    if (isBusy) return;
    if (advanceCalledRef.current) return; // prevent double-advance
    advanceCalledRef.current = true;
    setIsBusy(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mode === 'local') {
      const q = localShuffled[index];
      const correct = selected && typeof selected.optionIndex === 'number' && selected.optionIndex === q.answerIndex;
      // record local result (use ref to avoid race)
      const entry = { question: q.question, selected: selected ? q.options[selected.optionIndex ?? -1] : null, correct: q.options[q.answerIndex || 0] };
      localResultsRef.current.push(entry);
      setLocalResults(localResultsRef.current.slice());
      // show popped visual for this option
      if (selected && typeof selected.optionIndex === 'number') setPoppedIndex(selected.optionIndex);
      if (correct) {
        const base = 100;
        const bonus = Math.round(base * 0.1 * streak);
        setScore((s) => s + base + bonus);
        setStreak((st) => st + 1);
      } else {
        setStreak(0);
      }
      // if this was the last question, finish immediately so the user sees results right away
      if (index + 1 < localShuffled.length) {
        // small feedback delay before advancing
        window.setTimeout(() => {
          setIsBusy(false);
          setIndex((i) => i + 1);
        }, 300);
      } else {
        setIsBusy(false);
        finishLocal();
      }
    } else {
      // api mode: record selection, advance; correctness will be evaluated server-side
      const q = apiQuestions ? apiQuestions[index] : null;
      if (q) {
        // update ref immediately to avoid race with finishApi
        selectedAnswersRef.current = { ...selectedAnswersRef.current, [q.id]: selected ? selected.optionId || null : null };
        setSelectedAnswers({ ...selectedAnswersRef.current });
        // mark popped visual for selected option index if possible
        if (selected && typeof selected.optionIndex === 'number') setPoppedIndex(selected.optionIndex);
      }
      // if there are more questions, advance after a short feedback pause; otherwise submit immediately
      if (index + 1 < (apiQuestions || []).length) {
        window.setTimeout(() => {
          setIsBusy(false);
          setIndex((i) => i + 1);
        }, 300);
      } else {
        // immediately show submitting overlay and submit answers so the user sees the results right away
        setIsSubmitting(true);
        (async () => {
          try {
            await finishApi();
          } finally {
            setIsSubmitting(false);
            setIsBusy(false);
          }
        })();
      }
    }
  }

  function handleBubbleClick(e: React.MouseEvent, i: number, optionId?: string) {
    try {
      // spawn confetti at click position relative to bubble area
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const area = bubbleAreaRef.current;
      if (area) {
        const areaRect = area.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 - areaRect.left;
        const centerY = rect.top + rect.height / 2 - areaRect.top;
        spawnConfetti(centerX, centerY);
      }
    } catch (err) {
      // ignore confetti errors
    }
    // forward to normal advance without changing logic
    advance(mode === 'local' ? { optionIndex: i } : { optionId: optionId, optionIndex: i });
  }

  function spawnConfetti(x: number, y: number) {
    const colors = ['#f97316', '#f43f5e', '#fb7185', '#60a5fa', '#34d399', '#f59e0b'];
    const pieces = Array.from({ length: 12 }).map((_, idx) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${idx}`;
      const left = `${x + (Math.random() - 0.5) * 40}px`;
      const top = `${y + (Math.random() - 0.5) * 20}px`;
      const bg = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.round(Math.random() * 120);
      return { id, left, top, bg, delay };
    });
    setConfetti((c) => c.concat(pieces));
    // remove them after animation
    window.setTimeout(() => {
      setConfetti((c) => c.filter(p => !pieces.find(pi => pi.id === p.id)));
    }, 1100);
  }

  async function finishApi() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token || !apiQuizId || !apiQuestions) {
        if (onComplete) onComplete(score);
        if (onClose) onClose();
        return;
      }
      // Prefer ref-backed answers to avoid missing the most recent selection when state is stale
      const refAnswers = selectedAnswersRef.current || {};
      const answers = (apiQuestions || []).map((q) => ({ question_id: q.id, selected_option_id: refAnswers[q.id] ?? selectedAnswers[q.id] }));
        try {
          console.log('BubbleMinigame: submitting answers', answers);
          console.log('BubbleMinigame: submitting answers JSON', JSON.stringify(answers));
        } catch (e) {}
      const resp = await fetch(`/api/quizzes/${apiQuizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers }),
      });
      const result = await resp.json();
      console.log('BubbleMinigame: attempt result', result);
      // map server results to a UI-friendly summary
      const total = result.totalQuestions || (apiQuestions || []).length;
      const correctCount = result.correctCount ?? 0;
      const rawResults = result.results || [];
      const mapped = rawResults.reduce((acc: any[], r: any) => {
        if (!r || !r.question_id) return acc;
        const q = (apiQuestions || []).find((qq) => qq.id === r.question_id);
        const selectedOpt = q?.options.find((o) => o.id === r.selected_option_id);
        const correctOpt = q?.options.find((o) => o.id === r.correct_option_id);
        acc.push({ question_text: q?.question_text || '', selected_value: selectedOpt?.option_text || null, correct_value: correctOpt?.option_text || null, is_correct: !!r.is_correct });
        return acc;
      }, [] as any[]);
      const summary = { score: result.score ?? Math.round((correctCount / (total || 1)) * 100), totalQuestions: total, correctCount, results: mapped };
      setFinishedResults(summary);
      if (typeof summary.score === 'number') {
        setScore(summary.score);
        if (onComplete) onComplete(summary.score);
      } else {
        if (onComplete) onComplete(score);
      }
    } catch (e) {
      console.error('BubbleMinigame submit failed', e);
      if (onComplete) onComplete(score);
    } finally {
      // do NOT auto-close here; show results so user can review
    }
  }

  function finishLocal() {
    // compile a results summary similar to API shape using ref to avoid race
    const total = localResultsRef.current.length || localShuffled.length;
    const correctCount = (localResultsRef.current || []).filter((r) => r.selected === r.correct).length;
    const results = (localResultsRef.current.length ? localResultsRef.current : localShuffled.map((q) => ({ question: q.question, selected: null, correct: q.options[q.answerIndex || 0] }))).map((r: any) => ({ question_text: r.question, selected_value: r.selected, correct_value: r.correct, is_correct: r.selected === r.correct }));
    const summary = { score: Math.round((correctCount / (total || 1)) * 100), totalQuestions: total, correctCount, results };
    console.log('BubbleMinigame: local results', localResultsRef.current);
    setFinishedResults(summary);
    if (onComplete) onComplete(summary.score);
    // do not auto-close so the user can review
  }

  function restart() {
    setLocalShuffled(shuffle(pool).slice(0, count));
    setApiQuestions(null);
    setApiQuizId(null);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswers({});
    selectedAnswersRef.current = {};
    localResultsRef.current = [];
    setLocalResults([]);
    setFinishedResults(null);
    setIsBusy(false);
    // force api refetch when restarting API mode
    setMode(questions && questions.length > 0 ? 'local' : 'api');
    setApiReloadCounter((c) => c + 1);
  }

  const currentLocal = localShuffled[index];
  const currentApi = apiQuestions ? apiQuestions[index] : null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border-2 border-black rounded-lg p-6 relative" style={{ minHeight: 420, overflow: 'visible', paddingBottom: 20 }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">Bubble Blitz</h3>
            <div className="text-sm text-gray-600">Tap the correct bubble before it floats away!</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Per question</div>
            <div className="text-xl font-semibold">{timePerQuestion}s</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-lg font-medium mb-2">{mode === 'local' ? currentLocal?.question : currentApi?.question_text || 'Loading question...'}</div>
            <div ref={bubbleAreaRef} className="relative h-64 w-full border border-dashed rounded overflow-hidden">
            {/* render bubbles */}
            {bubbleLayout && (mode === 'local' ? currentLocal?.options || [] : (currentApi?.options || []).map((o) => o.option_text)).map((text: any, i: number) => {
              const layout = bubbleLayout[i] || { left: 10 + i * 20, duration: timePerQuestion };
              const key = layout.key;
              const optionId = mode === 'local' ? undefined : currentApi?.options[i]?.id;
              const isPopped = poppedIndex === i;
              return (
                <button
                  key={key}
                  onClick={(e) => handleBubbleClick(e, i, optionId)}
                  disabled={isBusy}
                  className={`absolute bubble-btn ${isPopped ? 'bubble-popped' : 'bubble-normal'}`}
                  style={{ left: `${layout.left}%`, top: -40, transform: isPopped ? 'scale(1.08)' : 'translateY(0)', animation: (isPopped || finishedResults || isSubmitting) ? 'none' : `fall ${layout.duration}s linear forwards`, pointerEvents: (isBusy || !!finishedResults || isSubmitting) ? 'none' : 'auto' }}
                >
                  <span className="bubble-label">{text}</span>
                </button>
              );
            })}
            {/** confetti pieces rendered above bubbles */}
            {confetti.map(c => (
              <span key={c.id} className="confetti" style={{ left: c.left, top: c.top, background: c.bg, animationDelay: `${c.delay}ms` }} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-xl font-bold">{score} pts</div>
            <div className="text-sm text-gray-500">Streak: {streak}</div>
          </div>

          <div className="flex gap-3">
            {finishedResults ? (
              <>
                <button onClick={restart} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Restart</button>
                <button onClick={() => { setFinishedResults(null); if (onClose) onClose(); }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
              </>
            ) : (
              <button onClick={() => { if (onClose) onClose(); }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
            )}
          </div>
        </div>
        {(finishedResults || isSubmitting) && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg shadow-lg overlay-animate">
              {isSubmitting ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="loader" style={{ width: 40, height: 40, borderRadius: 20, border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', animation: 'spin 800ms linear infinite' }} />
                  <div className="text-lg font-medium">Submitting answers...</div>
                  <div className="text-sm text-gray-600">Hang tight — recording your attempt.</div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2">Results</h3>
                  <div className="text-sm text-gray-600 mb-2">Score: {finishedResults.score} ({finishedResults.correctCount}/{finishedResults.totalQuestions})</div>
                  <div className="space-y-2 mb-3 max-h-56 overflow-auto">
                    {(finishedResults.results || []).map((r: any, i: number) => (
                      <div key={i} className={`p-3 border rounded ${r.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="font-medium">{r.question_text || r.question}</div>
                        <div className="text-sm text-gray-700">Your answer: {r.selected_value ?? r.selected ?? 'No answer'}</div>
                        <div className="text-sm text-gray-700">Correct: {r.correct_value ?? r.correct}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => { setFinishedResults(null); restart(); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Restart</button>
                    <button onClick={() => { setFinishedResults(null); if (onClose) onClose(); }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fall { from { transform: translateY(0); } to { transform: translateY(420px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .overlay-animate { animation: fadeUp 280ms ease-out both; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* Bubble visual styles (purely visual - no timing logic changes) */
        .bubble-btn { position: absolute; border: none; padding: 0.5rem 1rem; border-radius: 9999px; color: white; font-weight: 600; cursor: pointer; box-shadow: 0 10px 22px rgba(16,24,40,0.12); text-shadow: 0 1px 0 rgba(0,0,0,0.12); will-change: transform; transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease; display: inline-flex; align-items: center; justify-content: center; }
        .bubble-normal { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); }
        .bubble-normal:hover { transform: translateY(4px) scale(1.02); box-shadow: 0 14px 30px rgba(16,24,40,0.18); }
        .bubble-popped { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); box-shadow: 0 8px 18px rgba(16,24,40,0.18); }
        .bubble-label { padding-left: 0.25rem; padding-right: 0.25rem; white-space: nowrap; }
        /* gentle shimmer highlight using pseudo-element */
        .bubble-btn::before { content: ''; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0)); mix-blend-mode: overlay; pointer-events: none; }
        /* pop feedback when clicked relies on inline transform; provide a smooth transition */
        .bubble-popped, .bubble-btn { transition: transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease; }
        /* confetti pieces */
        .confetti { position: absolute; width: 8px; height: 12px; border-radius: 2px; transform-origin: center; animation: confetti-fall 1000ms cubic-bezier(.17,.67,.34,1) forwards; box-shadow: 0 6px 10px rgba(0,0,0,0.12); }
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(160px) rotate(540deg) translateX(20px); opacity: 0; } }
      `}</style>

      
    </div>
  );
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

