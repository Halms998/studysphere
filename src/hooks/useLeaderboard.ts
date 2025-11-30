import { useState, useEffect, useMemo } from 'react';
import { LeaderboardRowData } from '../components/leaderboard/LeaderboardTable';

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const body = await res.json();
      setRows(body.leaderboard || []);
    } catch (e: any) {
      console.error('Leaderboard load error', e);
      setError(e.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (r.name || '').toLowerCase().includes(q));
  }, [rows, query]);

  return {
    rows: filteredRows,
    loading,
    error,
    query,
    setQuery,
    refresh: fetchLeaderboard
  };
}
