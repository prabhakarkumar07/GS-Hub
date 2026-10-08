"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/providers";
import { getSupabase } from "@/lib/supabase/client";
import { stripHtml } from "@/lib/html";
import type { Question } from "@/lib/types";
import { IconEdit, IconTrash } from "@/components/icons";

const PAGE = 25;

export function QuestionList() {
  const { taxonomy, subjectName, topicName } = useApp();
  const [rows, setRows] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [subject, setSubject] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [exam, setExam] = useState<string>("");
  const [status, setStatus] = useState<"all" | "live" | "dropped">("all");
  const [source, setSource] = useState<string>("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = getSupabase().from("questions").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (subject) query = query.eq("subject_id", Number(subject));
    if (topic) query = query.eq("topic_id", Number(topic));
    if (exam) query = query.eq("exam_id", Number(exam));
    if (status !== "all") query = query.eq("is_dropped", status === "dropped");
    if (source) query = query.eq("source", source);
    if (q.trim()) query = query.or(`question_en.ilike.%${q.trim().replace(/[%,()]/g, " ")}%,question_hi.ilike.%${q.trim().replace(/[%,()]/g, " ")}%`);
    const { data, count } = await query;
    setRows((data as Question[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, subject, topic, exam, status, source, q]);

  useEffect(() => { const h = setTimeout(load, 250); return () => clearTimeout(h); }, [load]);
  useEffect(() => { setPage(0); }, [subject, topic, exam, status, source, q]);

  const toggleDropped = async (row: Question) => {
    await getSupabase().from("questions").update({ is_dropped: !row.is_dropped }).eq("id", row.id);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_dropped: !r.is_dropped } : r)));
  };
  const remove = async (row: Question) => {
    if (!confirm("Delete this question permanently? Student attempts on it will also be removed. Prefer 'Mark dropped' for BPSC-cancelled questions.")) return;
    const { error } = await getSupabase().from("questions").delete().eq("id", row.id);
    if (error) alert(error.message); else load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-2xl">Questions <span className="text-base font-normal text-stone-500">({total})</span></h1>
        <div className="flex gap-2"><Link href="/admin/upload" className="btn-outline">Bulk upload</Link><Link href="/admin/questions/new" className="btn-primary">+ Add question</Link></div>
      </div>
      <div className="card mb-4 grid gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
        <input className="input lg:col-span-2" placeholder="Search question text…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={subject} onChange={(e) => { setSubject(e.target.value); setTopic(""); }}>
          <option value="">All subjects</option>{taxonomy.subjects.map((s) => <option key={s.id} value={s.id}>{s.name_en}</option>)}
        </select>
        <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={!subject}>
          <option value="">All topics</option>{taxonomy.topics.filter((t) => String(t.subject_id) === subject).map((t) => <option key={t.id} value={t.id}>{t.name_en}</option>)}
        </select>
        <select className="input" value={exam} onChange={(e) => setExam(e.target.value)}>
          <option value="">All exams</option>{taxonomy.exams.map((x) => <option key={x.id} value={x.id}>{x.short_name}</option>)}
        </select>
        <div className="flex gap-2">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">Any status</option><option value="live">Live</option><option value="dropped">Dropped</option>
          </select>
          <select className="input" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">Any source</option><option value="pyq">PYQ</option><option value="sample">Sample</option><option value="current_affairs">CA</option><option value="test_series">Test series</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-maroon-50/60 text-left text-xs uppercase text-stone-500">
              <tr><th className="px-4 py-2.5">Question</th><th className="px-2">Subject / topic</th><th className="px-2">Exam</th><th className="px-2 text-center">Ans</th><th className="px-2">Status</th><th className="px-4 text-right">Actions</th></tr>
            </thead>
            <tbody className={loading ? "opacity-50" : ""}>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-maroon/5 align-top">
                  <td className="max-w-md px-4 py-2.5">
                    <Link href={`/admin/questions/${r.id}`} className="hover:text-maroon">{stripHtml(r.question_en, 130)}</Link>
                    {!r.question_hi && <div className="mt-0.5 text-xs text-amber-700">Hindi missing</div>}
                  </td>
                  <td className="px-2 py-2.5"><div>{subjectName(r.subject_id)}</div><div className="text-xs text-stone-500">{r.topic_id ? topicName(r.topic_id) : "—"}</div></td>
                  <td className="px-2 py-2.5 text-stone-600">{taxonomy.exams.find((x) => x.id === r.exam_id)?.short_name ?? r.year ?? "—"}</td>
                  <td className="px-2 py-2.5 text-center font-bold text-green-700">{r.correct_option}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {r.is_dropped ? <span className="badge bg-red-100 text-red-800">Dropped</span> : <span className="badge bg-green-100 text-green-800">Live</span>}
                      {r.is_high_priority && <span className="badge bg-gold text-maroon-900">★</span>}
                      {r.source !== "pyq" && <span className="badge bg-stone-100 text-stone-600">{r.source}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => toggleDropped(r)} className="rounded-md border border-maroon/15 px-2 py-1 text-xs hover:bg-maroon-50">{r.is_dropped ? "Restore" : "Mark dropped"}</button>
                      <Link href={`/admin/questions/${r.id}`} className="rounded-md border border-maroon/15 p-1 text-maroon hover:bg-maroon-50" title="Edit"><IconEdit className="h-4 w-4" /></Link>
                      <button onClick={() => remove(r)} className="rounded-md border border-maroon/15 p-1 text-red-700 hover:bg-red-50" title="Delete"><IconTrash className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-stone-500">No questions match.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-maroon/10 px-4 py-3 text-sm">
          <span className="text-stone-500">{total ? `${page * PAGE + 1}–${Math.min(total, (page + 1) * PAGE)} of ${total}` : "0"}</span>
          <div className="flex gap-2">
            <button className="btn-outline !py-1.5" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
            <button className="btn-outline !py-1.5" disabled={(page + 1) * PAGE >= total} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
