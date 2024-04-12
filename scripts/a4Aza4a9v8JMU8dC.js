const talents = await Promise.all(["Frenzy", "Magic Resistance"].map(game.wfrp4e.utility.findTalent))
this.actor.createEmbeddedDocuments("Item", talents, {fromEffect : this.effect.id})