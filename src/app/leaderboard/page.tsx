"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api-client";
import { Spinner } from "@/components/ui";
import { IconTrophy } from "@/components/icons";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchApi("/user/leaderboard", {}, null);
        setLeaderboard(res.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
        setLeaderboard([]);
      }
    })();
  }, []);

  return (
    <main className="container-page py-8">
      <div className="mb-8 text-center">
        <h1 className="h-display mb-2 text-3xl text-maroon flex justify-center items-center gap-2">
          <IconTrophy /> Global Leaderboard
        </h1>
        <p className="text-stone-500">Compete with thousands of aspirants across India.</p>
      </div>

      <div className="mx-auto max-w-3xl">
        {!leaderboard ? (
          <Spinner label="Loading Leaderboard..." />
        ) : (
          <div className="card overflow-hidden">
            <ul className="divide-y divide-maroon/10">
              {leaderboard.length === 0 && (
                <li className="p-6 text-center text-stone-500">No scores recorded yet.</li>
              )}
              {leaderboard.map((user: any, idx: number) => (
                <li key={user.id} className={`flex items-center gap-4 px-6 py-4 ${idx < 3 ? 'bg-gold-50/30' : ''}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-md' :
                    idx === 1 ? 'bg-slate-300 text-slate-800 shadow-md' :
                    idx === 2 ? 'bg-orange-400 text-orange-950 shadow-md' :
                    'bg-stone-100 text-stone-500'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink truncate">{user.full_name || 'Anonymous User'}</div>
                    <div className="text-xs text-stone-500">
                      {user.quizzes_taken || 0} Quizzes taken · {Math.round(((user.correct_answers || 0) / Math.max(1, user.total_answers || 1)) * 100)}% Accuracy
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display text-lg font-bold text-maroon">{Math.round(user.total_score || 0)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">Score</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
