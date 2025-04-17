export const calculateOutstandingTax = (member, inactiveWeeks, taxConfig) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = Math.ceil((((now - new Date(currentYear, 0, 1)) / 86400000) + now.getDay() + 1) / 7);
    const startYear = 2025;
    const startWeek = 14;
  
    const goldValue = (val) => {
      if (typeof val === "string") {
        if (val.endsWith("s")) return parseFloat(val) / 100;
        if (val.endsWith("g")) return parseFloat(val);
      }
      return parseFloat(val);
    };
  
    const weeks = [];
    for (let y = startYear; y <= currentYear; y++) {
      const maxW = y === currentYear ? currentWeek : 52;
      const minW = y === startYear ? startWeek : 1;
      for (let w = minW; w <= maxW; w++) {
        weeks.push(`${y}-W${w}`);
      }
    }
  
    const unpaidWeeks = weeks.filter((w) => {
      const isPaid = member.paidWeeks?.[w];
      const isInactive = inactiveWeeks?.some((entry) => entry.member_name === member.name && entry.week === w);
      return !isPaid && !isInactive;
    });
  
    if (unpaidWeeks.length === 0) return null;
  
    const level = member.level || 0;
    let taxRate = taxConfig.high;
    if (level < 10) taxRate = taxConfig.low;
    else if (level < 20) taxRate = taxConfig.mid;
  
    const total = unpaidWeeks.reduce((sum) => sum + goldValue(taxRate), 0);
    const shortWeeks = unpaidWeeks.slice(0, 3).join(", ");
    const more = unpaidWeeks.length > 3 ? `… +${unpaidWeeks.length - 3}` : "";
  
    return `Offen: ${total.toFixed(2)}g (${shortWeeks}${more ? ` ${more}` : ""})`;
  };
  