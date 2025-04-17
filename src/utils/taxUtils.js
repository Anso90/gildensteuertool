export function calculateOutstandingTax(member, inactiveWeeks, taxConfig) {
    if (!member || !member.paidWeeks || !member.name) return null;
  
    const parseGold = (val) => {
      if (typeof val === "string") {
        if (val.endsWith("s")) return parseFloat(val) / 100;
        if (val.endsWith("g")) return parseFloat(val);
      }
      return parseFloat(val);
    };
  
    const formatGold = (g) => {
      const gold = Math.floor(g);
      const silver = Math.round((g - gold) * 100);
      if (gold && silver) return `${gold}g ${silver}s`;
      if (gold) return `${gold}g`;
      if (silver) return `${silver}s`;
      return "0g";
    };
  
    const getTax = (lvl) => {
      if (lvl < 10) return parseGold(taxConfig.low);
      if (lvl < 20) return parseGold(taxConfig.mid);
      return parseGold(taxConfig.high);
    };
  
    const thisYear = new Date().getFullYear();
    const thisWeek = Math.ceil(
      ((new Date() - new Date(thisYear, 0, 1)) / 86400000 +
        new Date(thisYear, 0, 1).getDay() +
        1) /
        7
    );
  
    const unpaidWeeks = [];
  
    for (let y = 2025; y <= thisYear; y++) {
      const minWeek = y === 2025 ? 14 : 1;
      const maxWeek = y === thisYear ? thisWeek : 52;
  
      for (let w = minWeek; w <= maxWeek; w++) {
        const key = `${y}-W${w}`;
        const paid = member.paidWeeks[key];
        const isInactive = inactiveWeeks.some(
          (entry) => entry.member_name === member.name && entry.week === key
        );
  
        if (!paid && !isInactive) {
          unpaidWeeks.push(key);
        }
      }
    }
  
    if (!unpaidWeeks.length) return null;
  
    const taxPerWeek = getTax(member.level);
    const total = taxPerWeek * unpaidWeeks.length;
  
    return `Offen: ${formatGold(total)} (${unpaidWeeks.join(", ")})`;
  }
  