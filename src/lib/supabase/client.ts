// Re-exports for backwards compatibility.
// Components that need a user-scoped client should use `useClerkSupabase()` from "./clerk-client".
// This file keeps the public (anon-key) getSupabase() function accessible at its original path.
export { getSupabase } from "./clerk-client";
