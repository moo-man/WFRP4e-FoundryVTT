let lore = this.effect.name.split("(")[1].split(")")[0].toLowerCase();

// If channelling corresponding lore
if (args.type == "channelling" && args.spell.system.lore.value == lore)
    args.prefillModifiers.slBonus  += 3
// If channelling or casting different lore
else if (args.spell.system.lore.value != lore && args.spell.system.lore.value != "petty")
    args.prefillModifiers.slBonus  -= 1