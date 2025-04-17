// MemberTable.jsx
import { useEffect, useState } from "react";
import { calculateOutstandingTax } from "../utils/taxUtils";
import { supabase } from "../auth/supabaseClient";

export default function MemberTable({ members, setMembers, taxConfig }) {
  const [inactiveWeeks, setInactiveWeeks] = useState([]);

  useEffect(() => {
    const fetchInactive = async () => {
      const { data } = await supabase.from("inactive_members").select("*");
      setInactiveWeeks(data || []);
    };
    fetchInactive();
  }, []);

  const parseGold = (val) => {
    if (val.endsWith("g")) return parseFloat(val);
    if (val.endsWith("s")) return parseFloat(val) / 100;
    return 0;
  };

  const classColors = {
    Cleric: "bg-yellow-500", Tank: "bg-cyan-400", Mage: "bg-blue-800",
    Ranger: "bg-green-400", Rogue: "bg-green-700", Bard: "bg-purple-600", Fighter: "bg-red-600",
  };

  const getAllPastWeeks = () => {
    const weeks = [];
    const startWeek = 14;
    const startYear = 2025;
    const now = new Date();
    const thisYear = now.getFullYear();

    for (let y = startYear; y <= thisYear; y++) {
      const maxWeek = y === thisYear
        ? Math.ceil((((now - new Date(y, 0, 1)) / 86400000) + new Date(y, 0, 1).getDay() + 1) / 7)
        : 52;
      const minWeek = y === startYear ? startWeek : 1;
      for (let w = minWeek; w <= maxWeek; w++) {
        weeks.push(`${y}-W${w}`);
      }
    }

    return weeks;
  };

  const totalTax = members.reduce(
    (sum, m) => sum + parseGold(taxConfig.low),
    0
  );

  const classCounts = members.reduce((acc, m) => {
    acc[m.class] = (acc[m.class] || 0) + 1;
    return acc;
  }, {});

  const weekKeys = getAllPastWeeks();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Mitglieder</h2>
      <div className="bg-obsDark text-obsGray border border-obsRed p-4 rounded-lg">
        <div>👥 <strong>Gesamtmitglieder:</strong> {members.length}</div>
        <div>💰 <strong>Insgesamte Gildensteuer pro Woche:</strong> {totalTax.toFixed(2)}g</div>
      </div>
      <ul className="space-y-1 mt-4">
        {members.map((member) => {
          const taxText = calculateOutstandingTax(member, inactiveWeeks, taxConfig);
          return (
            <li key={member.id} className={`p-2 rounded text-white text-sm ${classColors[member.class] || "bg-gray-700"}`}>
              <div className="font-semibold">{member.name}</div>
              <div className="text-xs italic text-yellow-200">{taxText}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
