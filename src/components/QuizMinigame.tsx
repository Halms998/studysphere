import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type LocalQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex?: number; // only for local/sample questions
};

type ApiQuestion = {
  id: string;
  question_text: string;
  options: { id: string; option_text: string }[];
};

interface Props {
  onClose?: () => void;
  onComplete?: (score: number) => void;
  questions?: LocalQuestion[]; // optional local override
  count?: number; // how many questions per round
  timePerQuestion?: number; // seconds
}

export default function QuizMinigame({ onClose, onComplete, questions, count = 5, timePerQuestion = 12 }: Props) {
  const sampleQuestions: LocalQuestion[] = useMemo(
    () => [
      { id: 's1', question: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answerIndex: 1 },
      { id: 's2', question: 'Which HTML element stores the main heading of a page?', options: ['head', 'main', 'h1', 'header'], answerIndex: 2 },
      { id: 's3', question: 'Which of these is a primary color in additive color (light)?', options: ['Red', 'Green', 'Blue', 'Yellow'], answerIndex: 2 },
      { id: 's4', question: 'In JavaScript, which keywords declare block-scoped variables?', options: ['var', 'let', 'const', 'both let and const'], answerIndex: 3 },
      { id: 's5', question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Coded Style Sheets'], answerIndex: 0 },
    ],
    []
  );

  const poolLocal = questions && questions.length > 0 ? questions : sampleQuestions;

  // State for both local and API-backed flows
  const [mode, setMode] = useState<'local' | 'api'>(() => (questions && questions.length > 0 ? 'local' : 'api'));
  const [localShuffled, setLocalShuffled] = useState<LocalQuestion[]>(() => shuffleArray(poolLocal).slice(0, count));
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[] | null>(null);
  const [apiQuizId, setApiQuizId] = useState<string | null>(null);
  const [apiReloadCounter, setApiReloadCounter] = useState(0);

  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string | null>>({}); // question_id -> selected option id (api)
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [finishedResults, setFinishedResults] = useState<any | null>(null);
  const [apiSubmitting, setApiSubmitting] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const timerRef = useRef<number | null>(null);
  const advanceGuardRef = useRef(false);

  // Fetch a quiz and its questions when in API mode. Re-run when `mode` becomes 'api'.
  useEffect(() => {
    let cancelled = false;
    async function loadFromApi() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          // fallback to local
          setMode('local');
          return;
        }

        setApiQuestions(null);

        // get quizzes list
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

        // dedupe questions by id (some server responses may include duplicates)
        const byId: Record<string, ApiQuestion> = {};
        for (const q of raw) byId[q.id] = q;
        const unique = Object.values(byId);

        if (cancelled) return;

        // take first `count` questions (shuffled)
        setApiQuestions(shuffleArray(unique).slice(0, count));
        setMode('api');
      } catch (e) {
        console.warn('Failed to load quiz from API, falling back to local sample questions', e);
        setMode('local');
      }
    }

    if (mode === 'api') {
      loadFromApi();
    }

    return () => { cancelled = true; };
  }, [mode, count, apiReloadCounter]);

  // Timer per question — only start when the current question is ready
  useEffect(() => {
    // determine if we have a current question
    const hasCurrent = (mode === 'local' && localShuffled && localShuffled[index]) || (mode === 'api' && apiQuestions && apiQuestions[index]);
    if (!hasCurrent) {
      // don't start timer until question available
      setTimeLeft(timePerQuestion);
      return;
    }

    setTimeLeft(timePerQuestion);
    // reset advance guard when a new question starts
    advanceGuardRef.current = false;
    if (timerRef.current) window.clearInterval(timerRef.current);
    // use interval for visible countdown but ensure timeout always advances even if transient flags are set
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          // robust timeout handler: advance even if isSelecting/apiSubmitting are true
          const localAdvance = () => {
            if (advanceGuardRef.current) return; // already advancing from another path
            advanceGuardRef.current = true;
            if (mode === 'local') {
              // mimic handleSelect(null) for local
              if (showFeedback) return;
              setSelectedIndex(null);
              setShowFeedback(true);
              setStreak(0);
              window.setTimeout(() => {
                setShowFeedback(false);
                setSelectedIndex(null);
                if (index + 1 < localShuffled.length) setIndex((i) => i + 1);
                else finishLocal();
              }, 900);
            } else {
              // API mode: record null selection and advance/submit
              // if API questions aren't loaded yet, reset timer and retry later
              if (!apiQuestions || !apiQuestions[index]) {
                console.warn('QuizMinigame: timeout fired but apiQuestions not ready — retrying');
                advanceGuardRef.current = false;
                setTimeLeft(timePerQuestion);
                return;
              }
              const q = apiQuestions[index];
              setSelectedOptionIds((s) => ({ ...s, [q.id]: null }));
              // clear any running timer
              if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
              setTimeLeft(timePerQuestion);
              // short delay like handleSelect to show feedback
              setTimeout(() => {
                if (index + 1 < (apiQuestions || []).length) {
                  setIndex((i) => i + 1);
                } else {
                  setApiSubmitting(true);
                  finishApiAttempt();
                }
              }, 220);
            }
          };

          try { localAdvance(); } catch (e) { console.error('timeout advance failed', e); }
          return 0;
        }
        return t - 1;
      });
    }, 1000) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, mode, apiQuestions, localShuffled, timePerQuestion]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function handleSelect(choiceIndex: number | null) {
    if (apiSubmitting) return; // prevent duplicates while submitting
    if (mode === 'local') {
      if (showFeedback) return;
      const q = localShuffled[index];
      const correct = choiceIndex !== null && choiceIndex === q.answerIndex;
      setSelectedIndex(choiceIndex);
      setShowFeedback(true);
      if (choiceIndex !== null && correct) {
        const base = 100;
        const bonus = Math.round(base * 0.1 * streak);
        const pts = base + bonus;
        setScore((s) => s + pts);
        setStreak((st) => st + 1);
      } else {
        setStreak(0);
      }

      window.setTimeout(() => {
        setShowFeedback(false);
        setSelectedIndex(null);
        if (index + 1 < localShuffled.length) setIndex((i) => i + 1);
        else finishLocal();
      }, 900);
    } else {
      // API mode: record the selected option id and move on; correctness will be determined when submitting attempt
      if (isSelecting) return;
      const q = apiQuestions ? apiQuestions[index] : null;
      if (!q) return;
      const selectedOptionId = choiceIndex === null ? null : q.options[choiceIndex]?.id || null;
      setSelectedOptionIds((s) => ({ ...s, [q.id]: selectedOptionId }));

      // briefly block additional clicks and advance after a short feedback delay
      setIsSelecting(true);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(timePerQuestion);
      window.setTimeout(() => {
        setIsSelecting(false);
        if (index + 1 < (apiQuestions || []).length) {
          setIndex((i) => i + 1);
        } else {
          // submit attempt — show submitting overlay immediately so user sees progress
          setApiSubmitting(true);
          finishApiAttempt();
        }
      }, 220);
    }
  }

  async function finishApiAttempt() {
    if (apiSubmitting) return;
    setApiSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token || !apiQuizId || !apiQuestions) {
        // fallback: show simple local score
        if (onComplete) onComplete(score);
        if (onClose) onClose();
        return;
      }

      const answers = apiQuestions.map((q) => ({ question_id: q.id, selected_option_id: selectedOptionIds[q.id] }));

      const resp = await fetch(`/api/quizzes/${apiQuizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers }),
      });

      const result = await resp.json();
      setFinishedResults(result);
      // update local score so UI reflects server-calculated score
      setScore(result.score || 0);
      if (onComplete) onComplete(result.score || 0);
      setApiSubmitting(false);
    } catch (e) {
      console.error('Failed to submit quiz attempt', e);
      if (onComplete) onComplete(score);
      setApiSubmitting(false);
    }
  }

  function finishLocal() {
    if (onComplete) onComplete(score);
    if (onClose) onClose();
  }

  function restart() {
    if (mode === 'local') {
      const next = shuffleArray(poolLocal).slice(0, count);
      setLocalShuffled(next);
      setIndex(0);
      setSelectedIndex(null);
      setScore(0);
      setStreak(0);
      setShowFeedback(false);
      setFinishedResults(null);
      setTimeLeft(timePerQuestion);
    } else {
      // re-fetch API questions
      setApiQuestions(null);
      setApiQuizId(null);
      setIndex(0);
      setSelectedOptionIds({});
      setFinishedResults(null);
      setApiSubmitting(false);
      setTimeLeft(timePerQuestion);
      // force reload even if mode is already 'api'
      setMode('api');
      setApiReloadCounter((c) => c + 1);
    }
  }

  const localQ = localShuffled[index];
  const apiQ = apiQuestions ? apiQuestions[index] : null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border-2 border-black rounded-lg p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">Quick Quiz</h3>
            <div className="text-sm text-gray-600">{mode === 'api' ? 'Practice course questions' : 'Practice sample questions'}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Time</div>
            <div className="text-xl font-semibold">{timeLeft}s</div>
          </div>
        </div>

        {/* Question area */}
        <div className="mb-4">
          {mode === 'local' && localQ && (
            <>
              <div className="text-lg font-medium mb-2">{localQ.question}</div>
              <div className="grid grid-cols-1 gap-2">
                {localQ.options.map((opt, i) => {
                  const isSelected = selectedIndex === i;
                  const isCorrect = showFeedback && i === localQ.answerIndex;
                  const wrongSelected = showFeedback && isSelected && i !== localQ.answerIndex;
                  const btnClass = isCorrect ? 'bg-green-200 border-green-500' : wrongSelected ? 'bg-red-200 border-red-500' : 'bg-gray-100 hover:bg-gray-200';
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={showFeedback} className={`text-left px-4 py-3 rounded border ${btnClass}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === 'api' && !apiQuestions && (
            <div className="py-6 text-center text-gray-500">Loading questions...</div>
          )}

          {mode === 'api' && apiQ && !finishedResults && (
            <>
              <div className="text-lg font-medium mb-2">{apiQ.question_text}</div>
              <div className="grid grid-cols-1 gap-2">
                {apiQ.options.map((opt, i) => (
                  <button key={opt.id} onClick={() => handleSelect(i)} disabled={isSelecting || apiSubmitting} className={`text-left px-4 py-3 rounded border bg-gray-100 hover:bg-gray-200 ${isSelecting || apiSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    {opt.option_text}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode === 'api' && finishedResults && (
            <div className="space-y-3">
              <div className="text-lg font-medium">Results</div>
              <div className="text-sm text-gray-500">Score: {finishedResults.score} ({finishedResults.correctCount}/{finishedResults.totalQuestions})</div>
              <div className="space-y-2">
                {(() => {
                  const raw: any[] = finishedResults.results || [];
                  const seen: Record<string, boolean> = {};
                  const deduped: any[] = [];
                  for (const r of raw) {
                    if (!seen[r.question_id]) {
                      deduped.push(r);
                      seen[r.question_id] = true;
                    }
                  }
                  return deduped.map((r: any) => {
                    const q = apiQuestions?.find((qq) => qq.id === r.question_id);
                    const selectedOpt = q?.options.find((o) => o.id === r.selected_option_id);
                    const correctOpt = q?.options.find((o) => o.id === r.correct_option_id);
                    return (
                      <div key={r.question_id} className={`p-3 border rounded ${r.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="font-medium">{q?.question_text}</div>
                        <div className="text-sm text-gray-700">Your answer: {selectedOpt?.option_text || 'No answer'}</div>
                        <div className="text-sm text-gray-700">Correct: {correctOpt?.option_text || '—'}</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-xl font-bold">{score} pts</div>
            <div className="text-sm text-gray-500">Streak: {streak}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={restart} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Restart</button>
            {mode === 'local' && (
              <button onClick={() => { if (onComplete) onComplete(score); if (onClose) onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Finish</button>
            )}
            <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
          </div>
        </div>
        {/* Submitting overlay for API mode */}
        {apiSubmitting && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center" style={{ minWidth: 220 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, border: '4px solid #e5e7eb', borderTopColor: '#10b981', animation: 'spin 800ms linear infinite' }} />
              <div className="text-lg font-medium mt-3">Submitting answers...</div>
              <div className="text-sm text-gray-600 mt-1">Recording your attempt — hang tight.</div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function shuffleArray<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
