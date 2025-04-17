export const calculateOutstandingTax = (member, inactiveWeeks, taxConfig) => {
    if (!member || !member.paidWeeks) return "";
  
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = Math.ceil(
      ((now - new Date(currentYear, 0, 1)) / 86400000 + new Date(currentYear, 0, 1).getDay() + 1) / 7
    );
  
    const isInactive = (name, week) =>
      inactiveWeeks.some((w) => w.member_name === name && w.week === week);
  
    const weeksToCheck = Object.keys(member.paidWeeks || {}).filter((weekKey) => {
      const [, w] = weekKey.split("-W");
      const weekNumber = parseInt(w, 10);
      return weekNumber <= currentWeek && !member.paidWeeks[weekKey] && !isInactive(member.name, weekKey);
    });
  
    if (weeksToCheck.length === 0) return "";
  
    const level = member.level || 0;
    let gold = 0;
    for (const week of weeksToCheck) {
      let amount = taxConfig.low;
      if (level >= 10 && level < 20) amount = taxConfig.mid;
      if (level >= 20) amount = taxConfig.high;
      if (typeof amount === "string") {
        if (amount.endsWith("s")) gold += parseFloat(amount) / 100;
        else if (amount.endsWith("g")) gold += parseFloat(amount);
      } else {
        gold += parseFloat(amount);
      }
    }
  
    return `Offen: ${gold.toFixed(2)}g (${weeksToCheck.join(", ")})`;
  };
  