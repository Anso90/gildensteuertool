import { useState, useEffect } from "react";
import { supabase } from "../auth/supabaseClient";
import { loadPaidWeeks } from "../services/paymentService";

const classes = ["Cleric", "Tank", "Mage", "Ranger", "Rogue", "Bard", "Fighter"];

export default function MemberManager({ setMembers, taxConfig }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [klasse, setKlasse] = useState("");
  const [saving, setSaving] = useState(false);

  const calculateTax = (level, config) => {
    const lvl = parseInt(level);
    if (lvl < 10) return config.low;
    if (lvl < 20) return config.mid;
    return config.high;
  };

  // 🔄 Mitglieder & paidWeeks laden
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.from("members").select("*");
      if (error) {
        console.error("❌ Fehler beim Laden der Mitglieder:", error.message);
        return;
      }

      const loadedMembers = await Promise.all(
        data.map(async (member) => {
          const paidWeeks = await loadPaidWeeks(member.id);
          return {
            ...member,
            tax: calculateTax(member.level, taxConfig),
            paidWeeks,
          };
        })
      );

      setMembers(loadedMembers);
    };

    fetchMembers();
  }, [setMembers, taxConfig]);

  const addMember = async () => {
    if (!name || !level || !klasse) return;

    setSaving(true);

    const newMember = {
      name,
      level: parseInt(level),
      class: klasse,
      tax: calculateTax(level, taxConfig),
      paidWeeks: {},
    };

    const { data, error } = await supabase.from("members").insert({
      name: newMember.name,
      level: newMember.level,
      class: newMember.class,
    }).select();

    if (error || !data) {
      console.error("❌ Fehler beim Speichern in Supabase:", error?.message);
      setSaving(false);
      return;
    }

    // Supabase gibt ID zurück, daher hinzufügen
    const savedMember = {
      ...newMember,
      id: data[0].id,
    };

    setMembers(prev => [...prev, savedMember]);

    setName("");
    setLevel("");
    setKlasse("");
    setSaving(false);
  };

  return (
    <div className="bg-obsDark border border-obsRed p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-obsRed mb-4">🧍 Mitglied hinzufügen</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-2 rounded text-black"
      />

      <input
        type="number"
        placeholder="Level"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full p-2 mb-2 rounded text-black"
      />

      <select
        value={klasse}
        onChange={(e) => setKlasse(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
      >
        <option value="">– Klasse wählen –</option>
        {classes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <button
        onClick={addMember}
        className="bg-obsRed hover:bg-red-800 px-4 py-2 rounded text-white w-full"
        disabled={saving}
      >
        {saving ? "Speichern..." : "Hinzufügen"}
      </button>
    </div>
  );
}
