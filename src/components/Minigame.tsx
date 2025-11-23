import React, { useState } from 'react';
import ReactionTimeMinigame from './ReactionTimeMinigame';
import QuizMinigame from './QuizMinigame';
import BubbleMinigame from './BubbleMinigame';
import ImageReactionMinigame from './ImageReactionMinigame';
import imageReactionCategories from '../data/imageReactionCategories';

type GameKey = 'reaction' | 'quiz' | 'bubble' | 'image';

export default function Minigame() {
  const [active, setActive] = useState<GameKey | null>(null);
  const [lastScore, setLastScore] = useState<Record<GameKey, number | null>>({ reaction: null, quiz: null, bubble: null, image: null });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Minigames</h1>
        <p className="text-sm text-gray-600 mb-6">Play short minigames to relax between study sessions.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Reaction Time</h3>
            <p className="text-sm text-gray-500 mb-3">See how fast you can click after the signal.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActive('reaction')}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Play
              </button>
              {lastScore.reaction !== null && (
                <div className="text-sm text-gray-700 self-center">Last: {lastScore.reaction} ms</div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Quick Quiz</h3>
            <p className="text-sm text-gray-500 mb-3">Practice short multiple-choice questions from your course material.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActive('quiz')}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Play
              </button>
              {lastScore.quiz !== null && (
                <div className="text-sm text-gray-700 self-center">Last: {lastScore.quiz} pts</div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Bubble Blitz</h3>
            <p className="text-sm text-gray-500 mb-3">Answers float down as bubbles — tap the correct one before it disappears.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActive('bubble')}
                className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Play
              </button>
              {lastScore.bubble !== null && (
                <div className="text-sm text-gray-700 self-center">Last: {lastScore.bubble} pts</div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Image Reaction</h3>
            <p className="text-sm text-gray-500 mb-3">Match statements to images quickly — frontend-only rounds.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActive('image')}
                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Play
              </button>
              {lastScore.image !== null && (
                <div className="text-sm text-gray-700 self-center">Last: {lastScore.image} pts</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / active game area */}
      {active && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white border-2 border-black rounded-lg overflow-auto">
            {active === 'reaction' && (
              <ReactionTimeMinigame
                onClose={() => setActive(null)}
                onComplete={(summary) => {
                  // store average ms as last score
                  setLastScore((s) => ({ ...s, reaction: summary.avgMs }));
                }}
              />
            )}

            {active === 'quiz' && (
              <QuizMinigame
                onClose={() => setActive(null)}
                onComplete={(score) => {
                  setLastScore((s) => ({ ...s, quiz: score }));
                }}
              />
            )}

            {active === 'bubble' && (
              <BubbleMinigame
                onClose={() => setActive(null)}
                onComplete={(score) => {
                  setLastScore((s) => ({ ...s, bubble: score }));
                }}
              />
            )}

            {active === 'image' && (
              <ImageReactionMinigame
                categories={imageReactionCategories}
                onClose={() => setActive(null)}
                onComplete={(score) => {
                  setLastScore((s) => ({ ...s, image: score }));
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
