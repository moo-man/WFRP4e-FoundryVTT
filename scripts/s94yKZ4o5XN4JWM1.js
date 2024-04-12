// Any attack with such ammunition which inflicts at least one Wound,
// also inflicts one Bleeding Condition.

if (args.totalWoundLoss > 0) {
  args.actor.addCondition("bleeding")
}
