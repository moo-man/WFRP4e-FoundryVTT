if (args.totalWoundLoss > 0)
{
   args.actor.addCondition("ablaze", Math.max(1, parseInt(args.opposedTest.attackerTest.result.SL) + 1))
}