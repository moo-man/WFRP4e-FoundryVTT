const talents = await Promise.all(["Schemer", "Second Sight"].map(game.wfrp4e.utility.findTalent))
this.actor.createEmbeddedDocuments("Item", talents, {fromEffect : this.effect.id})