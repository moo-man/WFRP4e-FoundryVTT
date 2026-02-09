if (args.totalWoundLoss > 0)
{
   args.actor.addCondition("ablaze", Math.max(1, parseInt(args.sourceTest?.result.SL) + 1))
}