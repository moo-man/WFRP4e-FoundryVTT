if (args.totalWoundLoss > this.actor.system.status.wounds.value || args.opposedTest?.attackerTest.result.critical)
{
  args.extraMessages.push(`<strong>${this.effect.name}</strong>: Can reverse Critical Wound roll`)
}