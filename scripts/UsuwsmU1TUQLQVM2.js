let lore = this.effect.name.split("(")[1].split(")")[0].toLowerCase();
return !args.spell || (args.type == "cast" && ["petty", lore].includes(args.spell.system.lore.value));