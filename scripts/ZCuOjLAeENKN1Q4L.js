let halve;
if (args.opposedTest.attackerTest.item?.type != "spell")
{
    halve = await Dialog.confirm({title : this.effect.name, content : "Halve Damage? (Halves Damage from all fire)"})
}
else
{
    halve = args.opposedTest.attackerTest.item?.system.lore?.value == "fire";
}

if (halve)
{
    args.totalWoundLoss /= 2;
    args.modifiers.other.push({label : this.effect.name, details : "Halved", value : "× 0.5"})
}