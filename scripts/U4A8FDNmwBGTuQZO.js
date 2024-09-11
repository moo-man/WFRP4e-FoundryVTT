if (args.attacker.has(game.i18n.localize("NAME.Undead")) && !args.attacker.has(game.i18n.localize("NAME.Ethereal")))
{
    args.totalWoundLoss =  Math.floor(args.totalWoundLoss / 2)
    args.modifiers.other.push({label : this.effect.name, details : game.i18n.localize("Halved"), value : "× 0.5"})
}