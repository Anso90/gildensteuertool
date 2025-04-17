import { useRef, useEffect, useState } from "react";
import { supabase } from "../auth/supabaseClient";
import { setPaymentStatus } from "../services/paymentService";

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

  for (let year = START_YEAR; year <= currentYear; year++) {
    const maxWeeks = 52;
    const weekStart = year === START_YEAR ? START_WEEK : 1;

    for (let w = weekStart; w <= maxWeeks; w++) {
      weeks.push({ year, week: w });
    }
  }

  return weeks;
};

export default function TaxCalendar({ members, setMembers }) {
  const allWeeks = getAllFutureWeeks();
  const scrollRef = useRef(null);
  const topScrollRef = useRef(null);
  const [inactiveWeeks, setInactiveWeeks] = useState([]);

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

  useEffect(() => {
    const fetchInactive = async () => {
      const { data } = await supabase.from("inactive_members").select("*");
      setInactiveWeeks(data || []);
    };
    fetchInactive();
  }, []);

  const toggleWeek = async (memberIndex, key) => {
    const updated = [...members];
    const member = updated[memberIndex];

    const current = member.paidWeeks?.[key] || false;
    const newStatus = !current;

    member.paidWeeks = {
      ...member.paidWeeks,
      [key]: newStatus,
    };

    setMembers(updated);
    await setPaymentStatus(member.id, key, newStatus);
  };

  return (
    <div className="bg-obsDark border border-obsRed p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-obsRed mb-4">
        📅 Steuer-Kalender ab KW {START_WEEK} / {START_YEAR}
      </h2>

      {/* obere Scrollleiste */}
      <div
        ref={topScrollRef}
        className="overflow-x-auto mb-2 h-4"
        style={{ scrollbarHeight: 0 }}
      >
        <div style={{ width: `${allWeeks.length * 120}px`, height: "1px" }} />
      </div>

      {/* Tabelle */}
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
                  const inactive = inactiveWeeks.some(
                    (entry) =>
                      entry.member_name === m.name && entry.week === key
                  );

                  return (
                    <td
                      key={key}
                      className={`p-2 ${
                        inactive
                          ? "bg-gray-500 text-white"
                          : paid
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {inactive ? (
                        "inaktiv"
                      ) : (
                        <input
                          type="checkbox"
                          checked={paid}
                          onChange={() => toggleWeek(i, key)}
                        />
                      )}
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
