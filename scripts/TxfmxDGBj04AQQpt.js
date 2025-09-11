let weapon = args.opposedTest.defenderTest.weapon
if (
    !args.opposedTest.result.swapped && 
    args.opposedTest.result.winner == "defender" && 
    args.opposedTest.attackerTest.result.damage && 
    weapon && 
    weapon?.system.properties.qualities.fast
    )
{
    await args.opposedTest.swap(this.effect.name);
}