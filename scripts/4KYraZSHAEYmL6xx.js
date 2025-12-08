if (this.item.equipped.value && args.totalWoundLoss > 10) {
  args.totalWoundLoss = Math.min(10, args.totalWoundLoss)
  args.extraMessages.push(`<strong>${this.effect.name}</strong>: Wound loss capped to 10`)  
}