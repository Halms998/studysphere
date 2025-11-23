import React, { useEffect, useMemo, useRef, useState } from 'react';

type Option = { id: string; image: string; label?: string; isCorrect?: boolean };
type Q = { id: string; statement: string; options: Option[] };

type Category = { id: string; title: string; questions: Q[] };

interface Props {
  onClose?: () => void;
  onComplete?: (score: number) => void;
  // optional to let parent pass custom categories; otherwise component uses local sample data
  categories?: Category[];
  timePerQuestion?: number; // seconds
}

// Small helper to generate placeholder SVG data URLs so this component works without any external images.
function placeholderDataUrl(label: string, w = 380, h = 220, bg = '#e6eef8') {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='${bg}' rx='12'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family="Arial, Helvetica, sans-serif" font-size='20' fill='#334155'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ImageReactionMinigame({ onClose, onComplete, categories: incoming, timePerQuestion = 4 }: Props) {
  const sample = useMemo<Category[]>(() => [
    {
      id: 'movies',
      title: 'Movies',
      questions: Array.from({ length: 10 }).map((_, i) => ({
        id: `movies-q-${i + 1}`,
        statement: i % 2 === 0 ? 'Pick the scene with the hero' : 'Pick the movie poster',
        options: Array.from({ length: 4 }).map((__, j) => ({ id: `m-${i}-${j}`, image: placeholderDataUrl(`Movies ${i + 1}-${j + 1}`), label: `Img ${j + 1}`, isCorrect: j === (i % 4) }))
      }))
    },
    {
      id: 'food',
      title: 'Food',
      questions: Array.from({ length: 10 }).map((_, i) => ({
        id: `food-q-${i + 1}`,
        statement: i % 2 === 0 ? 'Pick the picture of pizza' : 'Pick the dessert',
        options: Array.from({ length: 4 }).map((__, j) => ({ id: `f-${i}-${j}`, image: placeholderDataUrl(`Food ${i + 1}-${j + 1}`, 380, 220, '#fff1f2'), label: `Img ${j + 1}`, isCorrect: j === (i % 4) }))
      }))
    },
    {
      id: 'anime',
      title: 'Anime',
      questions: Array.from({ length: 10 }).map((_, i) => ({
        id: `anime-q-${i + 1}`,
        statement: 'Pick the character that matches the description',
        options: Array.from({ length: 4 }).map((__, j) => ({ id: `a-${i}-${j}`, image: placeholderDataUrl(`Anime ${i + 1}-${j + 1}`, 380, 220, '#f0f9ff'), label: `Img ${j + 1}`, isCorrect: j === (i % 4) }))
      }))
    }
  ], []);

  const categories = incoming && incoming.length > 0 ? incoming : sample;

  const [step, setStep] = useState<'select' | 'play' | 'results'>('select');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const qIndexRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const timerRef = useRef<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processGuardRef = useRef(false);
  const [results, setResults] = useState<{ qId: string; selected?: string | null; correct?: boolean }[]>([]);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  function startCategory(cat: Category) {
    setSelectedCategory(cat);
    // shallow clone questions and shuffle options per question
    const q = cat.questions.map((qq, qidx) => {
      const options = qq.options.map((o, oi) => ({
        id: (o as any).id || `${cat.id}-q${qidx}-opt${oi}`,
        image: o.image,
        label: (o as any).label || `Img ${oi + 1}`,
        isCorrect: !!o.isCorrect
      })).sort(() => Math.random() - 0.5);

      const base = { ...qq, options } as any;
      // ensure each question has a stable id so results can be mapped correctly
      if (!base.id) base.id = `${cat.id}-q${qidx}`;
      return base as Q;
    });
    setQuestions(q);
    setQIndex(0);
    qIndexRef.current = 0;
    setResults([]);
    setStep('play');
    setTimeLeft(timePerQuestion);
    startTimer();
  }

  function startTimer() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimeLeft(timePerQuestion);
    startRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          // treat as no answer
          processAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000) as unknown as number;
  }

  async function processAnswer(optionId: string | null) {
    if (isProcessing || processGuardRef.current) return;
    processGuardRef.current = true;
    setIsProcessing(true);
    // stop timer
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    const currentIndex = qIndexRef.current;
    const q = questions[currentIndex];
    const rt = startRef.current ? Date.now() - startRef.current : undefined;
    const picked = optionId;
    const correct = picked ? q.options.find(o => o.id === picked)?.isCorrect === true : false;

    // single-attempt result record (no reaction-time UI stored)
    setResults(prev => [...prev, { qId: q.id, selected: picked, correct }]);

    // show feedback briefly
    await new Promise(resolve => setTimeout(resolve, 650));

    const next = currentIndex + 1;
    if (next < questions.length) {
      setQIndex(next);
      qIndexRef.current = next;
      setTimeLeft(timePerQuestion);
      setIsProcessing(false);
      processGuardRef.current = false;
      startTimer();
    } else {
      // finish
      setIsProcessing(false);
      processGuardRef.current = false;
      setStep('results');
      if (onComplete) {
        const correctCount = results.concat([{ qId: q.id, selected: picked, correct, rtMs: rt }]).filter(r => r.correct).length;
        const score = Math.round((correctCount / questions.length) * 100);
        onComplete(score);
      }
    }
  }

  function handleCloseDuringPlay() {
    // clear timer and guards, then either call parent close or return to select
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    processGuardRef.current = false;
    setIsProcessing(false);
    startRef.current = null;
    if (onClose) onClose(); else setStep('select');
  }

  function restartRound() {
    if (!selectedCategory) return;
    startCategory(selectedCategory);
  }

  const correctCount = results.filter(r => r.correct).length;
  const avgRtDisplay = '—';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border-2 border-black rounded-lg p-6" style={{ maxHeight: '80vh', overflow: 'auto' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">Focus Match</h3>
            <div className="text-sm text-gray-600">Quick visual match rounds to wake up your focus</div>
          </div>
          <div className="text-right flex flex-col items-end space-y-2">
                <div className="text-sm text-gray-500">Per question</div>
                <div className="flex items-center space-x-3">
                  <svg viewBox="0 0 36 36" className="w-9 h-9">
                    <circle cx="18" cy="18" r="15" className="text-gray-200" strokeWidth="4" fill="none" stroke="currentColor" />
                    {/* dynamic ring */}
                    {
                      (() => {
                        const radius = 15;
                        const circ = 2 * Math.PI * radius;
                        const st = circ * ((timeLeft) / timePerQuestion);
                        return <circle cx="18" cy="18" r="15" strokeWidth="4" fill="none" stroke="#ef4444" strokeDasharray={`${st} ${Math.max(0, circ - st)}`} strokeLinecap="round" transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 300ms linear' }} />;
                      })()
                    }
                  </svg>
                  <div className="text-xl font-semibold tabular-nums">{timeLeft}s</div>
                  {step === 'play' && (
                    <button onClick={handleCloseDuringPlay} aria-label="Close game" className="w-9 h-9 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white border border-red-700">×</button>
                  )}
                </div>
          </div>
        </div>

        {step === 'select' && (
          <div>
            <div className="mb-3 text-sm text-gray-700">Choose a category to begin a 10-question round.</div>
            <div className="grid grid-cols-3 gap-3">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => startCategory(cat)} className="p-4 border rounded text-left hover:shadow">
                  <div className="font-medium">{cat.title}</div>
                  <div className="text-xs text-gray-500">{cat.questions.length} questions</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'play' && selectedCategory && questions[qIndex] && (
          <div>
            <div className="text-lg font-medium mb-2">{questions[qIndex].statement}</div>
            <div className="grid grid-cols-2 gap-3">
              {questions[qIndex].options.map((opt, oi) => {
                return (
                  <div key={opt.id} className="relative">
                    <button onClick={() => processAnswer(opt.id)} disabled={isProcessing} className={`block p-0 border rounded overflow-hidden ${isProcessing ? 'opacity-70' : 'hover:scale-105'} transition-transform`}>
                      <img src={opt.image} alt={opt.label || 'option'} style={{ display: 'block', width: '100%', height: 260, objectFit: 'contain', objectPosition: 'center', backgroundColor: '#000' }} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-600">Question {qIndex + 1} / {questions.length}</div>
          </div>
        )}

        {step === 'results' && (
          <div>
            <h3 className="text-xl font-bold">Results</h3>
            <div className="text-sm text-gray-600 mb-3">Score: {Math.round((correctCount / questions.length) * 100)} ({correctCount}/{questions.length})</div>
            <div className="space-y-2 mb-4" style={{ maxHeight: '50vh', overflow: 'auto', paddingRight: 8 }}>
              {results.map((r, i) => {
                const q = questions.find(qq => qq.id === r.qId);
                const picked = q?.options.find(o => o.id === r.selected);
                const correct = q?.options.find(o => o.isCorrect);
                return (
                  <div key={r.qId} className={`p-3 border rounded ${r.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="font-medium mb-2">{q?.statement}</div>
                    <div className="text-sm text-gray-700 mb-1"><strong>Correct answer:</strong> {correct?.label || '—'}</div>
                    <div className="text-sm text-gray-700"><strong>Your answer:</strong> {picked?.label || '—'}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={restartRound} className="px-4 py-2 bg-blue-500 text-white rounded">Restart</button>
              <button onClick={() => { setStep('select'); }} className="px-4 py-2 bg-gray-200 rounded">Choose category</button>
              <button onClick={() => { if (onClose) onClose(); }} className="px-4 py-2 bg-red-500 text-white rounded">Close</button>
            </div>
            
          </div>
        )}

      </div>
      
    </div>
  );
}
