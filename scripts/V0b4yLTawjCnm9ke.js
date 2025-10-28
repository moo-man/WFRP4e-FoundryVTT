if (args.opposedTest.attackerTest.result.critical
    || (args.totalWoundLoss > 0 && args.totalWoundLoss > args.actor.system.status.wounds.value))
{
  await args.actor.corruptionDialog("minor")
}