"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signUp = async () => {
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return setError(error.message);

    router.push("/profile/setup");
  };

  const signIn = async () => {
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setError(error.message);

    router.push("/profile/setup");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Signup / Login</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={signUp}>Sign up</button>
        <button onClick={signIn} style={{ marginLeft: 8 }}>
          Sign in
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
