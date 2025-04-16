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
  
  const START_WEEK = 19;
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
  
    const toggleWeek = (memberIndex, key) => {
      const updated = [...members];
      const paid = updated[memberIndex].paidWeeks || {};
      paid[key] = !paid[key];
      updated[memberIndex].paidWeeks = paid;
      setMembers(updated);
    };
  
    return (
      <div className="bg-obsDark border border-obsRed p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold text-obsRed mb-4">
          📅 Steuer-Kalender ab KW {START_WEEK} / {START_YEAR}
        </h2>
  
        {/* Obere Scroll-Sync-Bar */}
        <div
          className="overflow-x-auto h-4 mb-2"
          ref={(el) => {
            if (el) {
              const content = document.getElementById("tax-scroll-sync");
              el.onscroll = () => (content.scrollLeft = el.scrollLeft);
              content.onscroll = () => (el.scrollLeft = content.scrollLeft);
            }
          }}
        >
          <div style={{ width: "2000px" }} />
        </div>
  
        {/* Kalender Tabelle */}
        <div id="tax-scroll-sync" className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full table-fixed border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-obsDark text-white p-2 text-left border-r border-obsRed bg-opacity-90">
                  Mitglied
                </th>
                {allWeeks.map(({ year, week }) => (
                  <th key={`${year}-W${week}`} className="p-2 bg-obsDark text-white whitespace-nowrap">
                    {getWeekDateRange(week, year)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i} className="border-t border-gray-600 text-center">
                  <td className="sticky left-0 z-10 bg-black bg-opacity-80 p-2 border-r border-obsRed text-white text-left font-medium">
                    {m.name}
                  </td>
                  {allWeeks.map(({ year, week }) => {
                    const key = `${year}-W${week}`;
                    const paid = m.paidWeeks?.[key] || false;
                    return (
                      <td
                        key={key}
                        className={`p-2 ${paid ? "bg-green-600" : "bg-red-600"}`}
                      >
                        <input
                          type="checkbox"
                          checked={paid}
                          onChange={() => toggleWeek(i, key)}
                        />
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
  