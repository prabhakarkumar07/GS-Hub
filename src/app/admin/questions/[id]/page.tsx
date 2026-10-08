import Link from "next/link";
import { QuestionForm } from "../QuestionForm";
export default async function EditQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h1 className="h-display text-2xl">Edit question</h1><Link href="/admin/questions" className="btn-ghost">← All questions</Link></div>
      <QuestionForm id={id} />
    </div>
  );
}
