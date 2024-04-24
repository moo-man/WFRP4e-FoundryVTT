const talents = await Promise.all(["Hardy"].map(game.wfrp4e.utility.findTalent))
this.actor.createEmbeddedDocuments("Item", talents, {fromEffect : this.effect.id})