import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import ProfileSetupForm from "./ProfileSetupForm";

type ActionState = {
  error: string | null;
};

async function submitProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/signup");

  const email = data.user.email ?? "";
  const domain = email.split("@")[1]?.toLowerCase().trim() ?? "";

  if (!domain) {
    return { error: "We couldn't verify your school email." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const major = String(formData.get("major") ?? "").trim();
  const age = Number(formData.get("age"));
  const graduationYear = Number(formData.get("graduation_year"));

  if (!name || !major || !age || !graduationYear) {
    return { error: "Please fill out all required fields." };
  }

  const { data: school, error: schoolError } = await supabase
    .from("allowed_schools")
    .select("id, school_name")
    .eq("email_domain", domain)
    .maybeSingle();

  if (schoolError) {
    return { error: "We couldn't verify your school. Try again." };
  }

  if (!school) {
    redirect("/not-available");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      name,
      age,
      graduation_year: graduationYear,
      major,
      school: school?.school_name ?? null,
      school_id: school?.id ?? null,
      profile_complete: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Error saving profile:", error);
    return { error: "We couldn't save your profile. Please try again." };
  }

  redirect("/swipe");
}

export default async function ProfileSetupPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/signup");

  const email = data.user.email ?? "";
  // Towson-only hard gate (optional)
  // const domain = email.split("@")[1]?.toLowerCase().trim() ?? "";
  // if (domain !== "towson.edu") redirect("/not-available");

  // Profile complete? skip setup
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, profile_complete")
    .eq("id", data.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile:", error);
    return (
      <div style={{ padding: 20 }}>
        <h1>Something went wrong</h1>
        <p>We couldn’t load your profile. Please refresh and try again.</p>
      </div>
    );
  }

  if (profile?.profile_complete) redirect("/swipe");

  return <ProfileSetupForm email={email} action={submitProfile} />;
}
