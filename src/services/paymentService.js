import { supabase } from "../auth/supabaseClient";

// 🔄 Alle Zahlungen für ein Mitglied laden
export const loadPaidWeeks = async (memberId) => {
  const { data, error } = await supabase
    .from("payments")
    .select("week, paid")
    .eq("member_id", memberId);

  if (error) {
    console.error("Fehler beim Laden der Wochenzahlungen:", error.message);
    return {};
  }

  const result = {};
  data.forEach((entry) => {
    result[entry.week] = entry.paid;
  });

  return result;
};

// ✅ Zahlung setzen (true/false) für eine Woche
export const setPaymentStatus = async (memberId, week, paid) => {
  const { error } = await supabase
    .from("payments")
    .upsert({ member_id: memberId, week, paid });

  if (error) {
    console.error("Fehler beim Speichern der Zahlung:", error.message);
  }
};
