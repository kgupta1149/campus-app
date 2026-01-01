import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import SwipeActions from "./SwipeActions";
import { revalidatePath } from "next/cache";

export default async function SwipePage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/signup");

  // Server actions
  async function pass(candidateId: string) {
    "use server";

    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/signup");

    // Try insert, ignore duplicate errors (user already swiped)
    const { error } = await supabase.from("swipes").insert({
      swiper_id: data.user.id,
      swipee_id: candidateId,
      direction: "left", // pass = left
    });

    // Ignore duplicate key errors (23505) - means already swiped, which is fine
    if (error && error.code !== "23505") {
      console.error("pass swipe error:", error);
    }

    revalidatePath("/swipe");
  }

  async function like(candidateId: string) {
    "use server";

    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/signup");

    // Try insert, ignore duplicate errors (user already swiped)
    const { error } = await supabase.from("swipes").insert({
      swiper_id: data.user.id,
      swipee_id: candidateId,
      direction: "right", // like = right
    });

    // Ignore duplicate key errors (23505) - means already swiped, which is fine
    if (error && error.code !== "23505") {
      console.error("like swipe error:", error);
    } else {
      // Did they already like me?
      const { data: reverse, error: reverseErr } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", candidateId)
        .eq("swipee_id", data.user.id)
        .eq("direction", "right")
        .maybeSingle();

      if (reverseErr) {
        console.error("reverse swipe check error:", reverseErr);
      } else if (reverse) {
        // Create match with stable ordering
        const userOne = data.user.id < candidateId ? data.user.id : candidateId;
        const userTwo = data.user.id < candidateId ? candidateId : data.user.id;

        const { error: matchErr } = await supabase.from("matches").upsert(
          { user_one: userOne, user_two: userTwo },
          { onConflict: "user_one,user_two" }
        );

        if (matchErr) console.error("match create error:", matchErr);
      }
    }

    revalidatePath("/swipe");
  }

  // Load my profile
  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id, profile_complete, school_id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (meError) return <div>Error loading your profile.</div>;
  if (!me?.profile_complete) redirect("/profile/setup");

  // Get users already swiped on
  const { data: swipes } = await supabase
    .from("swipes")
    .select("swipee_id")
    .eq("swiper_id", data.user.id);

  const swipedIds = swipes?.map((s) => s.swipee_id) || [];

  // Build query - exclude self and already-swiped users
  let query = supabase
    .from("profiles")
    .select("id, name, age, major")
    .eq("profile_complete", true)
    .eq("school_id", me.school_id)
    .neq("id", data.user.id);

  // Exclude already-swiped users if any
  if (swipedIds.length > 0) {
    query = query.not("id", "in", `(${swipedIds.join(",")})`);
  }

  const { data: candidate, error: candError } = await query
    .limit(1)
    .maybeSingle();

  if (candError) return <div>Error loading candidates.</div>;
  if (!candidate) return <div>No one to swipe on yet.</div>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Swipe</h1>

      <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
        <h2>
          {candidate.name}, {candidate.age}
        </h2>
        <p>{candidate.major}</p>

        <SwipeActions candidateId={candidate.id} onPass={pass} onLike={like} />
      </div>
    </main>
  );
}
