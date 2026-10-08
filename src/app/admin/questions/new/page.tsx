import Link from "next/link";
import { QuestionForm } from "../QuestionForm";
export default function NewQuestion() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h1 className="h-display text-2xl">Add question</h1><Link href="/admin/questions" className="btn-ghost">← All questions</Link></div>
      <QuestionForm />
    </div>
  );
}
