import React from 'react';
import { TrophyIcon } from '@heroicons/react/24/solid';

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const classes =
    rank === 1
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700'
      : rank === 2
      ? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600'
      : rank === 3
      ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-600';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${classes}`}>
      {rank <= 3 && <TrophyIcon className="w-4 h-4" />}
      #{rank}
    </span>
  );
}
