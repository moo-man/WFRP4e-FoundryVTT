// If this actor wins a defending test, swap the test
if (!args.opposedTest.result.swapped && args.opposedTest.result.winner == "defender" && args.opposedTest.attackerTest.result.damage)
{
    args.opposedTest.swap(this.effect.label);
}