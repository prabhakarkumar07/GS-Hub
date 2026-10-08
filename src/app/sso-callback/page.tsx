import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Clerk needs this page to complete the OAuth flow (Google, etc.).
 * After the provider redirects back, Clerk exchanges the code here,
 * sets the session, then redirects to NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL.
 */
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
