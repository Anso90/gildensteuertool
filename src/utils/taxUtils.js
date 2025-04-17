
export const calculateOutstandingTax = (member, inactiveWeeks, taxConfig) => {
  if (!member || !member.paidWeeks) return "";

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeek = Math.ceil(
    ((now - new Date(currentYear, 0, 1)) / 86400000 + new Date(currentYear, 0, 1).getDay() + 1) / 7
  );

  const weeks = Object.keys(member.paidWeeks || {}).filter((weekStr) => {
    const [yearStr, weekPart] = weekStr.split("-W");
    const year = parseInt(yearStr);
    const week = parseInt(weekPart);
    const isPast = year < currentYear || (year === currentYear && week <= currentWeek);

    const isPaid = member.paidWeeks[weekStr];
    const isInactive = inactiveWeeks.some(
      (i) => i.member_name === member.name && i.week === weekStr
    );

    return isPast && !isPaid && !isInactive;
  });

  if (weeks.length === 0) return "";

  const tax = member.level < 10 ? taxConfig.low : member.level < 20 ? taxConfig.mid : taxConfig.high;
  const amount = tax.endsWith("s")
    ? (parseFloat(tax) * weeks.length) / 100
    : parseFloat(tax) * weeks.length;

  const goldText = amount % 1 === 0 ? `${amount.toFixed(0)}g` : `${amount.toFixed(2)}g`;
  return `Offen: ${goldText} (${weeks.join(", ")})`;
};
