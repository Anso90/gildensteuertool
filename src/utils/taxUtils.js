export function calculateOutstandingTax(member, inactiveWeeks, taxConfig) {
  const now = new Date();
  const paid = member.paidWeeks || {};
  const unpaidWeeks = [];

  const parseGold = (val) => {
    if (typeof val === "string") {
      if (val.endsWith("s")) return parseFloat(val) / 100;
      if (val.endsWith("g")) return parseFloat(val);
    }
    return parseFloat(val);
  };

  const getTaxForLevel = (level) => {
    if (level < 10) return taxConfig.low;
    if (level < 20) return taxConfig.mid;
    return taxConfig.high;
  };

  const formatGold = (val) => {
    const g = Math.floor(val);
    const s = Math.round((val - g) * 100);
    return `${g > 0 ? g + "g " : ""}${s > 0 ? s + "s" : ""}`.trim();
  };

  const inactiveMap = new Set(
    inactiveWeeks
      .filter((i) => i.member_name === member.name)
      .map((i) => i.week)
  );

  const weekKeys = Object.keys(paid)
    .concat(inactiveWeeks.map((w) => w.week)) // ensure inactive weeks are considered
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  for (const key of weekKeys) {
    if (inactiveMap.has(key)) continue; // skip inactives
    const [year, weekLabel] = key.split("-W");
    const week = parseInt(weekLabel, 10);
    const weekStart = new Date(year, 0, 1 + (week - 1) * 7);
    if (weekStart > now) continue; // skip future
    if (!paid[key]) {
      unpaidWeeks.push(key);
    }
  }

  if (unpaidWeeks.length === 0) return "";

  const total = unpaidWeeks.reduce(
    (sum) => sum + parseGold(getTaxForLevel(member.level)),
    0
  );

  return `Offen: ${formatGold(total)} (${unpaidWeeks.join(", ")})`;
}