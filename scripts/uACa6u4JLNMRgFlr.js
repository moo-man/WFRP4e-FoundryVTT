const talents = await Promise.all(["Furious Assault", "Sea Legs"].map(game.wfrp4e.utility.findTalent))
this.actor.createEmbeddedDocuments("Item", talents, {fromEffect : this.effect.id})