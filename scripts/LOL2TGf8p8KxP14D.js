let wind = this.effect.name.split(" ")[2]
return args.type != "channelling" || game.wfrp4e.config.magicWind[args.item.system.lore.value] != wind;