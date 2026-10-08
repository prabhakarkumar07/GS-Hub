import { Suspense } from "react";
import { QuizBuilder } from "./QuizBuilder";

export const metadata = { title: "Quiz Builder" };

export default function PracticePage() {
  return (
    <Suspense>
      <QuizBuilder />
    </Suspense>
  );
}
