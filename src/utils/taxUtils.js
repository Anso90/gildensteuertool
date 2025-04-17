export function calculateOutstandingTax(member, inactiveWeeks, taxConfig) {
    if (!member || !member.paidWeeks) return "";
  
    const weekKeys = Object.keys(member.paidWeeks)
      .concat(
        inactiveWeeks
          .filter((entry) => entry.member_name === member.name)
          .map((entry) => entry.week)
      )
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
  
    const unpaid = [];
    let total = 0;
  
    for (const week of weekKeys) {
      const isPaid = member.paidWeeks[week];
      const isInactive = inactiveWeeks.some(
        (entry) =>
          entry.member_name === member.name && entry.week === week
      );
  
      if (!isPaid && !isInactive) {
        unpaid.push(week);
        const rate =
          member.level < 10
            ? taxConfig.low
            : member.level < 20
            ? taxConfig.mid
            : taxConfig.high;
  
        total += rate.endsWith("g")
          ? parseFloat(rate)
          : parseFloat(rate) / 100;
      }
    }
  
    if (unpaid.length === 0) return "";
  
    const gold = Math.floor(total);
    const silver = Math.round((total - gold) * 100);
  
    return `Offen: ${gold}g ${silver}s (${unpaid.join(", ")})`;
  }
  