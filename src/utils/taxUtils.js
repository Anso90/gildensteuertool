
export const calculateOutstandingTax = (member, inactiveWeeks, taxConfig) => {
  if (!member || !member.paidWeeks) return "";

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeek = Math.ceil(
    ((now - new Date(currentYear, 0, 1)) / 86400000 + new Date(currentYear, 0, 1).getDay() + 1) / 7
  );

  const startWeek = 14;
  const startYear = 2025;

  const weeks = [];
  for (let y = startYear; y <= currentYear; y++) {
    const maxWeek = y === currentYear ? currentWeek : 52;
    const minWeek = y === startYear ? startWeek : 1;

    for (let w = minWeek; w <= maxWeek; w++) {
      weeks.push({ key: `${y}-W${w}`, year: y, week: w });
    }
  }

  const isInactive = (weekKey) =>
    inactiveWeeks.some((entry) => entry.member_name === member.name && entry.week === weekKey);

  const parseGold = (val) => {
    if (val.endsWith("s")) return parseFloat(val) / 100;
    if (val.endsWith("g")) return parseFloat(val);
    return parseFloat(val);
  };

  const taxPerWeek = parseGold(
    member.level < 10 ? taxConfig.low : member.level < 20 ? taxConfig.mid : taxConfig.high
  );

  const unpaidWeeks = weeks.filter(
    ({ key }) => !member.paidWeeks[key] && !isInactive(key)
  );

  const total = unpaidWeeks.length * taxPerWeek;

  return unpaidWeeks.length > 0
    ? `Offen: ${total.toFixed(2)}g (${unpaidWeeks.map((w) => w.key).join(", ")})`
    : "";
};
