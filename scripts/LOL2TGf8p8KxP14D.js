let wind = this.effect.name.split(" ")[2]
return args.type != "cast" || game.wfrp4e.config.magicWind[args.item.system.lore.value[0]] != wind;