import React from 'react';
import { RankBadge } from './RankBadge';

export interface LeaderboardRowData {
  id: string;
  name: string;
  points: number;
  rank: number;
}

interface LeaderboardTableProps {
  rows: LeaderboardRowData[];
  currentUserId?: string;
}

export function LeaderboardTable({ rows, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="w-24 px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Name</th>
            <th className="w-40 px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isMe = currentUserId && row.id === currentUserId;
            return (
              <tr
                key={row.id}
                className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 even:bg-slate-50/60 dark:even:bg-slate-800/60 ${
                  isMe ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm">
                  <RankBadge rank={row.rank} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold">
                      {(row.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-medium ${isMe ? 'text-indigo-600 dark:text-indigo-300' : ''}`}>{row.name || 'Anonymous'}</div>
                      {isMe && <div className="text-[11px] text-indigo-500 dark:text-indigo-300">You</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {row.points.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
