let item = await fromUuid("Compendium.wfrp4e-core.items.TaYriYcJkFuIdBKp")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id});
