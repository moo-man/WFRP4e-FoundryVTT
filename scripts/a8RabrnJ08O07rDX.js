if (args.totalWoundLoss > 0)
{
    // I'm assuming the endurance test specified is for the end-round check
    await args.actor.addCondition("poisoned", 2);
}