export const calculateOutstandingTax = (member, inactiveWeeks, taxConfig) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = Math.ceil(
      ((now - new Date(currentYear, 0, 1)) / 86400000 +
        new Date(currentYear, 0, 1).getDay() +
        1) /
        7
    );
  
    const paidWeeks = member.paidWeeks || {};
    const startYear = 2025;
    const startWeek = 14;
    const goldVal = (val) =>
      val.endsWith("s") ? parseFloat(val) / 100 : parseFloat(val);
  
    const weeklyTax = goldVal(
      member.level < 10
        ? taxConfig.low
        : member.level < 20
        ? taxConfig.mid
        : taxConfig.high
    );
  
    let totalDue = 0;
    let missingWeeks = [];
  
    for (let y = startYear; y <= currentYear; y++) {
      const minWeek = y === startYear ? startWeek : 1;
      const maxWeek = y === currentYear ? currentWeek : 52;
  
      for (let w = minWeek; w <= maxWeek; w++) {
        const weekKey = `${y}-W${w}`;
        const isInactive = inactiveWeeks.some(
          (entry) =>
            entry.member_name === member.name && entry.week === weekKey
        );
  
        if (isInactive) continue;
  
        const paid = paidWeeks[weekKey] || false;
        if (!paid) {
          totalDue += weeklyTax;
          missingWeeks.push(weekKey);
        }
      }
    }
  
    if (totalDue === 0) return "";
  
    const gold = Math.floor(totalDue);
    const silver = Math.round((totalDue - gold) * 100);
    const display =
      (gold > 0 ? `${gold}g ` : "") + (silver > 0 ? `${silver}s` : "");
  
    return `Offen: ${display.trim()} (${missingWeeks.join(", ")})`;
  };
  