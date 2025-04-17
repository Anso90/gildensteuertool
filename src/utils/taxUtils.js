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
    const now = new Date();
  
    // ⛔ Wichtiger Punkt: Nur vergangene Wochen prüfen (keine zukünftigen)
    const unpaidWeeks = Object.entries(paidWeeks)
      .filter(([week, paid]) => {
        const [year, w] = week.split("-W").map(Number);
        const weekDate = getStartOfWeek(year, w);
        const isPast = weekDate < now;
        const isPaid = paid === true;
        const isInactive = inactiveWeeks.some(
          (entry) => entry.member_name === member.name && entry.week === week
        );
        return isPast && !isPaid && !isInactive;
      })
      .map(([week]) => week);
  
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
  