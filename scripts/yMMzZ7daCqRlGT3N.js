let item = args.opposedTest.attackerTest.item;
if (!item.isMagical && (item.type == "weapon" || item.type == "trait"))
{
    args.modifiers.other.push({label : this.effect.name, details : "Remove Damage Rating", value : -1 * (args.totalWoundLoss - args.opposedTest.result.differenceSL)})
}
