export function calculateOutstandingTax(member, inactiveWeeks, taxConfig) {
    const parseGold = (val) => {
      if (val.endsWith("s")) return parseFloat(val) / 100;
      if (val.endsWith("g")) return parseFloat(val);
      return 0;
    };
  
    const getTaxValue = (level) => {
      if (level < 10) return parseGold(taxConfig.low);
      if (level < 20) return parseGold(taxConfig.mid);
      return parseGold(taxConfig.high);
    };
  
    const paid = member.paidWeeks || {};
    const allWeeks = Object.keys(paid).sort();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = Math.ceil(
      ((now - new Date(currentYear, 0, 1)) / 86400000 + new Date(currentYear, 0, 1).getDay() + 1) / 7
    );
  
    const getInactiveKeySet = () =>
      new Set(
        inactiveWeeks
          .filter((e) => e.member_name === member.name)
          .map((e) => e.week)
      );
  
    const inactiveSet = getInactiveKeySet();
    const unpaidWeeks = allWeeks.filter(
      (w) => !paid[w] && !inactiveSet.has(w)
    );
  
    const total = unpaidWeeks.length * getTaxValue(member.level);
    if (total === 0) return null;
  
    const formattedTotal =
      total < 1
        ? `${Math.round(total * 100)}s`
        : `${Math.floor(total)}g${(total % 1 * 100).toFixed(0).padStart(2, "0")}s`;
  
    return `Offen: ${formattedTotal} (${unpaidWeeks.join(", ")})`;
  }
  