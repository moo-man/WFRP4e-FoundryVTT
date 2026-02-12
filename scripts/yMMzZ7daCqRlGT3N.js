let item = args.sourceItem;
if (item && !item.isMagical && (item.type == "weapon" || item.type == "trait") && args.opposedTest)
{
    args.modifiers.other.push({label : this.effect.name, details : "Remove Damage Rating", value : -1 * (args.totalWoundLoss - args.opposedTest.result.differenceSL)})
}
