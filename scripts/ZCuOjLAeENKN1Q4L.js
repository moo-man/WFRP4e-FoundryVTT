let halve;
if (args.sourceItem?.type != "spell")
{
    halve = await foundry.applications.api.DialogV2.confirm({window : {title : this.effect.name}, content : "Halve Damage? (Halves Damage from all fire)"})
}
else
{
    halve = args.sourceItem?.system.lore?.value == "fire";
}

if (halve)
{
    args.totalWoundLoss /= 2;
    args.modifiers.other.push({label : this.effect.name, details : "Halved", value : "× 0.5"})
}