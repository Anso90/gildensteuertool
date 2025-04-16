import { useState } from "react";
import { supabase } from "../auth/supabaseClient";
import { setPaymentStatus } from "../services/paymentService";

const classColors = {
  Cleric: "bg-yellow-500",
  Tank: "bg-cyan-400",
  Mage: "bg-blue-800",
  Ranger: "bg-green-400",
  Rogue: "bg-green-700",
  Bard: "bg-purple-600",
  Fighter: "bg-red-600",
};

const classList = Object.keys(classColors);

const getAllPastWeeks = () => {
  const weeks = [];
  const startWeek = 19;
  const startYear = 2025;
  const now = new Date();
  const thisYear = now.getFullYear();

  for (let y = startYear; y <= thisYear; y++) {
    const maxWeek =
      y === thisYear
        ? Math.ceil((((now - new Date(y, 0, 1)) / 86400000) + new Date(y, 0, 1).getDay() + 1) / 7)
        : 52;

    const minWeek = y === startYear ? startWeek : 1;
    for (let w = minWeek; w <= maxWeek; w++) {
      weeks.push(`${y}-W${w}`);
    }
  }

  return weeks;
};

export default function MemberTable({ members, setMembers, taxConfig }) {
  const weekKeys = getAllPastWeeks();

  const [filterClass, setFilterClass] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  const parseGold = (val) => {
    if (typeof val === "string") {
      if (val.endsWith("s")) return parseFloat(val) / 100;
      if (val.endsWith("g")) return parseFloat(val);
    }
    return parseFloat(val);
  };

  const calculateTax = (level) => {
    if (level < 10) return taxConfig.low;
    if (level < 20) return taxConfig.mid;
    return taxConfig.high;
  };

  const updateMember = async (index, field, value) => {
    const updated = [...members];
    updated[index][field] = field === "level" ? parseInt(value) : value;

    if (field === "level") {
      updated[index].tax = calculateTax(updated[index].level);
    }

    setMembers(updated);

    const { id, level, class: klasse } = updated[index];
    const { error } = await supabase
      .from("members")
      .update({ level, class: klasse })
      .eq("id", id);

    if (error) {
      console.error("❌ Fehler beim Speichern in Supabase:", error.message);
    }
  };

  const toggleWeek = async (index, week) => {
    const updated = [...members];
    const member = updated[index];
    const current = member.paidWeeks?.[week] || false;
    const newStatus = !current;

    member.paidWeeks = {
      ...member.paidWeeks,
      [week]: newStatus,
    };

    setMembers(updated);

    await setPaymentStatus(member.id, week, newStatus);
  };

  const removeMember = (index) => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const moveMember = (index, direction) => {
    const updated = [...members];
    const target = index + direction;
    if (target < 0 || target >= members.length) return;
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setMembers(updated);
  };

  const classCounts = members.reduce((acc, m) => {
    acc[m.class] = (acc[m.class] || 0) + 1;
    return acc;
  }, {});

  const totalTax = members.reduce(
    (sum, m) => sum + parseGold(calculateTax(m.level)),
    0
  );

  const countUnpaid = (paidWeeks = {}) =>
    weekKeys.filter((w) => !paidWeeks[w]).length;

  const latestPaidWeek = (paidWeeks = {}) => {
    const paid = weekKeys.filter((w) => paidWeeks[w]);
    return paid.length > 0 ? paid[paid.length - 1] : "–";
  };

  let visibleMembers = [...members];

  if (filterClass) {
    visibleMembers = visibleMembers.filter((m) => m.class === filterClass);
  }

  if (sortBy === "level") {
    visibleMembers.sort((a, b) => b.level - a.level);
  } else if (sortBy === "class") {
    visibleMembers.sort((a, b) => a.class.localeCompare(b.class));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Mitglieder</h2>

      <div className="bg-obsDark text-obsGray border border-obsRed p-4 rounded-lg">
        <div>
          👥 <strong>Gesamtmitglieder:</strong>{" "}
          <span
            onClick={() => setFilterClass(null)}
            className="cursor-pointer text-white"
          >
            {members.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 my-2">
          {classList.map((cls) =>
            classCounts[cls] ? (
              <span
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`cursor-pointer px-2 py-1 rounded text-white text-xs ${classColors[cls]}`}
              >
                {cls}: {classCounts[cls]}
              </span>
            ) : null
          )}
        </div>
        <div className="flex gap-2 mb-2 text-xs">
          <button
            onClick={() => setSortBy("level")}
            className="bg-blue-800 px-2 py-1 rounded text-white"
          >
            🔼 Level
          </button>
          <button
            onClick={() => setSortBy("class")}
            className="bg-red-700 px-2 py-1 rounded text-white"
          >
            🔤 Klasse
          </button>
          <button
            onClick={() => {
              setSortBy(null);
              setFilterClass(null);
            }}
            className="bg-gray-600 px-2 py-1 rounded text-white"
          >
            🔁 Zurücksetzen
          </button>
        </div>
        <div>
          💰 <strong>Insgesamte Gildensteuer pro Woche:</strong>{" "}
          {totalTax.toFixed(2)}g
        </div>
      </div>

      <ul className="space-y-1 mt-4">
        {visibleMembers.map((member) => {
          const index = members.findIndex((m) => m.id === member.id);
          const unpaid = countUnpaid(member.paidWeeks);
          const latestWeek = latestPaidWeek(member.paidWeeks);

          return (
            <li
              key={member.id}
              className={`flex flex-col sm:flex-row justify-between gap-2 p-2 rounded text-white text-sm ${
                classColors[member.class] || "bg-gray-700"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{member.name}</div>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  Level:
                  <input
                    type="number"
                    value={member.level}
                    onChange={(e) =>
                      updateMember(index, "level", e.target.value)
                    }
                    className="w-14 px-1 py-0.5 rounded text-black text-xs"
                  />
                  Klasse:
                  <select
                    value={member.class}
                    onChange={(e) =>
                      updateMember(index, "class", e.target.value)
                    }
                    className="px-1 py-0.5 rounded text-black text-xs"
                  >
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  Steuer: <strong>{calculateTax(member.level)}</strong>
                  {unpaid > 0 ? (
                    <span className="text-red-200">💸 {unpaid} offen</span>
                  ) : (
                    <span className="text-green-200">✅ {latestWeek}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {weekKeys.slice(-3).map((week) => (
                    <span
                      key={week}
                      onClick={() => toggleWeek(index, week)}
                      className={`px-2 py-0.5 rounded cursor-pointer text-xs ${
                        member.paidWeeks?.[week]
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {week}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col items-center gap-0.5 text-xs">
                <button onClick={() => moveMember(index, -1)}>⬆️</button>
                <button onClick={() => moveMember(index, 1)}>⬇️</button>
                <button
                  onClick={() => removeMember(index)}
                  className="hover:underline"
                >
                  ✖
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
