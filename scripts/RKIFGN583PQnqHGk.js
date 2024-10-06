if (args.opposedTest.result.hitloc.value == "body" && args.totalWoundLoss > 0)
{
    args.actor.addCondition("bleeding", 2)
    this.script.message("Gained 2 Bleeding Conditions")
}