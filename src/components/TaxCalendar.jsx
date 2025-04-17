import { useRef, useEffect } from "react";
import { addInactivity, removeInactivity } from "../services/supabaseInactivity";

const getWeekDateRange = (weekNumber, year) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7 - (firstDayOfYear.getDay() - 1);
  const weekStart = new Date(year, 0, 1 + daysOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const format = (d) =>
    d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });

  return `${format(weekStart)} - ${format(weekEnd)} (KW ${weekNumber})`;
};

const START_WEEK = 14;
const START_YEAR = 2025;

const getAllFutureWeeks = () => {
  const weeks = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  for (let year = START_YEAR; year <= currentYear + 1; year++) {
    const maxWeeks = 52;
    const weekStart = year === START_YEAR ? START_WEEK : 1;

    for (let w = weekStart; w <= maxWeeks; w++) {
      weeks.push({ year, week: w });
    }
  }

  return weeks;
};

export default function TaxCalendar({ members, setMembers, inactiveWeeks }) {
  const allWeeks = getAllFutureWeeks();
  const scrollRef = useRef(null);
  const topScrollRef = useRef(null);

  useEffect(() => {
    const top = topScrollRef.current;
    const bottom = scrollRef.current;

    if (!top || !bottom) return;

    const syncScroll = (src, dest) => () => (dest.scrollLeft = src.scrollLeft);

    top.addEventListener("scroll", syncScroll(top, bottom));
    bottom.addEventListener("scroll", syncScroll(bottom, top));

    return () => {
      top.removeEventListener("scroll", syncScroll(top, bottom));
      bottom.removeEventListener("scroll", syncScroll(bottom, top));
    };
  }, []);

  const toggleWeek = async (memberIndex, key, inactive) => {
    const updated = [...members];
    const paid = updated[memberIndex].paidWeeks || {};

    if (inactive) return; // nichts machen wenn inaktiv

    paid[key] = !paid[key];
    updated[memberIndex].paidWeeks = paid;
    setMembers(updated);
  };

  const toggleInactive = async (memberName, key, isCurrentlyInactive) => {
    if (isCurrentlyInactive) {
      await removeInactivity(memberName, key);
    } else {
      await addInactivity(memberName, key);
    }
    window.location.reload(); // simple refresh nach Änderung
  };

  return (
    <div className="bg-obsDark border border-obsRed p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-obsRed mb-4">
        📅 Steuer-Kalender ab KW {START_WEEK} / {START_YEAR}
      </h2>

      <div ref={topScrollRef} className="overflow-x-auto mb-2 h-4">
        <div style={{ width: `${allWeeks.length * 120}px`, height: "1px" }} />
      </div>

      <div ref={scrollRef} className="overflow-x-auto">
        <table className="min-w-max text-sm border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2 text-left sticky left-0 bg-black z-10 border-r border-obsRed">
                Mitglied
              </th>
              {allWeeks.map(({ year, week }) => (
                <th
                  key={`${year}-W${week}`}
                  className="p-2 whitespace-nowrap border border-gray-700"
                >
                  {getWeekDateRange(week, year)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i} className="border-t border-gray-600 text-center">
                <td className="p-2 text-left font-medium sticky left-0 bg-black border-r border-obsRed text-white z-10">
                  {m.name}
                </td>
                {allWeeks.map(({ year, week }) => {
                  const key = `${year}-W${week}`;
                  const paid = m.paidWeeks?.[key] || false;
                  const isInactive =
                    inactiveWeeks?.[key]?.has(m.name) || false;

                  return (
                    <td
                      key={key}
                      className={`p-2 ${
                        isInactive
                          ? "bg-gray-500 opacity-50"
                          : paid
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <input
                          type="checkbox"
                          checked={paid}
                          disabled={isInactive}
                          onChange={() => toggleWeek(i, key, isInactive)}
                        />
                        <button
                          className="text-xs underline mt-1"
                          onClick={() =>
                            toggleInactive(m.name, key, isInactive)
                          }
                        >
                          {isInactive ? "aktiv" : "inaktiv"}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
