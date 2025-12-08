return !this.item.equipped.value 
  || !args?.skill
  || !([game.i18n.localize("NAME.Charm"), 
    game.i18n.localize("NAME.Intimidate"), 
    game.i18n.localize("NAME.Leadership")].includes(args.skill.name))