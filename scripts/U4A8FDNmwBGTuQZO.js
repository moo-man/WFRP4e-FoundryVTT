if (args.attacker.has("Undead") && !args.attacker.has("Ethereal"))
{
    args.totalWoundLoss =  Math.floor(args.totalWoundLoss / 2)
    args.modifiers.other.push({label : this.effect.name, details : "Halved", value : "× 0.5"})
}