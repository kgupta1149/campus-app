import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function ProfileSetupPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/signup");

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile Setup</h1>
      <p>Logged in as: {data.user.email}</p>
      <p>Next: we’ll build the form and upsert into profiles.</p>
    </div>
  );
}
