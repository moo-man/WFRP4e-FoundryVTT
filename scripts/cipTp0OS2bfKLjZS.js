if (args.totalWoundLoss > 0) {
    await args.actor.addCondition("bleeding")
    await args.actor.addCondition("poisoned")
}