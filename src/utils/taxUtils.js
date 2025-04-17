export function calculateOutstandingTax(member, inactiveWeeks, taxConfig) {
    const START_WEEK = 14;
    const START_YEAR = 2025;
  
    const getAllPastWeeks = () => {
      const weeks = [];
      const now = new Date();
      const thisYear = now.getFullYear();
  
      for (let y = START_YEAR; y <= thisYear; y++) {
        const maxWeek = y === thisYear
          ? Math.ceil((((now - new Date(y, 0, 1)) / 86400000) + new Date(y, 0, 1).getDay() + 1) / 7)
          : 52;
  
        const minWeek = y === START_YEAR ? START_WEEK : 1;
        for (let w = minWeek; w <= maxWeek; w++) {
          weeks.push(`${y}-W${w}`);
        }
      }
      return weeks;
    };
  
    const isInactive = (memberName, week) =>
      inactiveWeeks.some((i) => i.member_name === memberName && i.week === week);
  
    const parseGold = (val) => {
      if (typeof val === "string") {
        if (val.endsWith("s")) return parseFloat(val) / 100;
        if (val.endsWith("g")) return parseFloat(val);
      }
      return parseFloat(val);
    };
  
    const calculateTax = (level) => {
      if (level < 10) return taxConfig.low;
      if (level < 20) return taxConfig.mid;
      return taxConfig.high;
    };
  
    const allWeeks = getAllPastWeeks();
    const unpaidWeeks = allWeeks.filter(
      (w) => !member.paidWeeks?.[w] && !isInactive(member.name, w)
    );
  
    if (unpaidWeeks.length === 0) return "";
  
    const taxValue = parseGold(calculateTax(member.level));
    const total = taxValue * unpaidWeeks.length;
    const gold = Math.floor(total);
    const silver = Math.round((total - gold) * 100);
  
    return `💰 Offen: ${gold}g ${silver}s (${unpaidWeeks.join(", ")})`;
  }
  