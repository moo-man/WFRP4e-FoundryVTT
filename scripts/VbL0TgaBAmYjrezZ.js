const talents = await Promise.all([game.i18n.localize("NAME.Hardy")].map(game.wfrp4e.utility.findTalent))
this.actor.createEmbeddedDocuments("Item", talents, {fromEffect : this.effect.id})