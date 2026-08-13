let skill = this.actor.itemTypes.skill.find(s => s.name === game.i18n.localize("NAME.Pray"));
skill.system.modifier.value -= 10;