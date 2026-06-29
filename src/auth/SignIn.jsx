import { signInWithGoogle, signOutUser } from "./firebase.js";
import { useAuth } from "./AuthProvider.jsx";

export function SignInButton() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-stone-600">{user.email}</span>
        <button
          onClick={signOutUser}
          className="px-3 py-1.5 rounded border border-stone-300 hover:bg-stone-100"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={signInWithGoogle}
      className="px-4 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-800"
    >
      Sign in with Google
    </button>
  );
}
