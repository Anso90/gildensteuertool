

export const parseGoldToFloat = (val) => {
  if (typeof val === "string") {
    if (val.endsWith("s")) return parseFloat(val) / 100;
    if (val.endsWith("g")) return parseFloat(val);
  }
  return parseFloat(val || 0);
};

export const calculateOutstandingTax = (member, inactiveWeeks = [], taxConfig) => {
  if (!member || !taxConfig) return "";

  const tax = member.level >= 20
    ? taxConfig.high
    : member.level >= 10
    ? taxConfig.mid
    : taxConfig.low;

  const taxValue = parseGoldToFloat(tax);
  const paidWeeks = member.paidWeeks || {};
  const allWeeks = getAllPastWeeks(); // 🔁 wichtig!

  const now = new Date();

  const unpaidWeeks = allWeeks.filter((week) => {
    const [year, w] = week.split("-W").map(Number);
    const weekDate = getStartOfWeek(year, w);
    if (weekDate >= now) return false;

    const isPaid = paidWeeks[week] === true;
    const isInactive = inactiveWeeks.some(
      (entry) => entry.member_name === member.name && entry.week === week
    );

    return !isPaid && !isInactive;
  });

  if (unpaidWeeks.length === 0) return "";

  const total = (unpaidWeeks.length * taxValue).toFixed(2);

  return `Offen: ${total}g (${unpaidWeeks.join(", ")})`;
};

// Hilfsfunktion: Anfangsdatum einer Woche berechnen
function getStartOfWeek(year, week) {
  const firstDay = new Date(year, 0, 1);
  const dayOfWeek = firstDay.getDay() || 7;
  const offset = ((week - 1) * 7) - (dayOfWeek - 1);
  return new Date(year, 0, 1 + offset);
}

function getAllPastWeeks() {
    const weeks = [];
    const startWeek = 14;
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
  }
  