import { createClient } from "@supabase/supabase-js";

// 🔐 Zugriff auf Umgebungsvariablen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL oder KEY fehlt!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🟩 Eintrag hinzufügen
export async function addInactivity(memberName, weekKey) {
  const { error } = await supabase
    .from("inactive_members")
    .upsert([
      {
        member_name: memberName,
        week: weekKey,
      },
    ]);
  if (error) console.error("Fehler beim Hinzufügen der Inaktivität:", error);
}

// 🟥 Eintrag entfernen
export async function removeInactivity(memberName, weekKey) {
  const { error } = await supabase
    .from("inactive_members")
    .delete()
    .eq("member_name", memberName)
    .eq("week", weekKey);
  if (error) console.error("Fehler beim Entfernen der Inaktivität:", error);
}

// 📥 Alle Inaktivitäts-Einträge holen
export async function getInactiveEntries() {
  const { data, error } = await supabase.from("inactive_members").select("*");
  if (error) {
    console.error("Fehler beim Laden der Inaktivitätsdaten:", error);
    return [];
  }
  return data;
}
