import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// 🟢 Online-Status-Aktualisierung
export async function updateLastSeen() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) {
    console.warn("Kein eingeloggter User gefunden – Online-Status konnte nicht aktualisiert werden.");
    return;
  }

  const { error } = await supabase
    .from("online_users")
    .upsert({
      user_id: user.id,
      username: user.email,
      last_seen: new Date().toISOString(),
    }, {
      onConflict: ["user_id"]
    });

  if (error) {
    console.error("❌ Fehler beim Upsert von Online-User:", error.message);
  }
}
