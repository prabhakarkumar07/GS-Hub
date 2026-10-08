import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <SignIn />
    </div>
  );
}
