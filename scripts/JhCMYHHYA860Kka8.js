return !this.actor.attacker || args.item?.system?.attackType !== "melee" || args.skill?.name !== game.i18n.localize("NAME.Dodge");