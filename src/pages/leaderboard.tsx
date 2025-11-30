import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/hooks/useauth';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  const { user } = useAuth(false);
  const { rows, loading, error, query, setQuery, refresh } = useLeaderboard();

  return (
    <div className="p-6">
      <Head>
        <title>Leaderboard • StudySphere</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold">Leaderboard</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
              />
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
              title="Refresh"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
            <Link href="/profile" className="text-sm text-gray-600 hover:underline whitespace-nowrap">Your profile</Link>
          </div>
        </div>

        {loading && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700">Error: {error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 text-sm text-slate-600 dark:text-slate-300">
            No users match your search.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <LeaderboardTable rows={rows} currentUserId={user?.id} />
        )}
      </div>
    </div>
  );
}
