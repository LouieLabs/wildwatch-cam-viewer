import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider.jsx";
import { SignInButton } from "./auth/SignIn.jsx";
import { fetchCaptures } from "./api/fetchCaptures.js";

function GalleryShell() {
  const { user, loading: authLoading } = useAuth();
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    fetchCaptures({ publicOnly: !user, limit: 50 })
      .then(setCaptures)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="px-6 py-4 flex items-center justify-between border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">WildWatch</h1>
          <p className="text-sm text-stone-500">Live from the backyard cameras.</p>
        </div>
        <SignInButton />
      </header>
      <main className="p-6">
        {/*
          STUDENT WORK STARTS HERE.
          Replace the stub below with your <FilterBar />, <GalleryGrid />,
          and <Lightbox /> components. See docs/wildwatch-student-guide.md.
        */}
        <p className="text-stone-600">
          {loading
            ? "Loading captures…"
            : `${captures.length} captures loaded. Build your gallery in src/components/.`}
        </p>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GalleryShell />
    </AuthProvider>
  );
}
