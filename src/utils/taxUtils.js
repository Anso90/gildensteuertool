// src/utils/taxUtils.js
import { getAllFutureWeeks } from "../components/TaxCalendar";

export const calculateOutstandingTax = (member, inactiveWeeks, taxConfig) => {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();
  const paid = member.paidWeeks || {};
  const futureWeeks = getAllFutureWeeks();

  const missingWeeks = futureWeeks
    .filter(({ year, week }) => {
      const key = `${year}-W${week}`;
      return (
        (year < currentYear || (year === currentYear && week <= currentWeek)) &&
        !paid[key] &&
        !inactiveWeeks.some(
          (entry) =>
            entry.member_name === member.name && entry.week === key
        )
      );
    })
    .map(({ year, week }) => `${week}`);

  const totalSilver = missingWeeks.reduce((sum, _) => {
    const level = parseInt(member.level || 0);
    const rate =
      level >= 20 ? taxConfig.high : level >= 10 ? taxConfig.mid : taxConfig.low;
    return sum + convertToSilver(rate);
  }, 0);

  return formatTaxDisplay(totalSilver, missingWeeks);
};

const convertToSilver = (value) => {
  if (!value) return 0;
  const num = parseInt(value);
  return value.includes("g") ? num * 100 : num;
};

const formatTaxDisplay = (silver, weeks) => {
  const g = Math.floor(silver / 100);
  const s = silver % 100;
  const text = `${g > 0 ? `${g}g ` : ""}${s > 0 ? `${s}s` : ""}`;
  const weekText = weeks.length > 0 ? ` (KW ${weeks.join(", ")})` : "";
  return weeks.length ? `Offen: ${text.trim()}${weekText}` : "✅ Alles bezahlt";
};

const getWeekNumber = (d) => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
};
