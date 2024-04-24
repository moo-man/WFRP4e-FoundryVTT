let item = await fromUuid("Compendium.wfrp4e-core.items.MVI0lXcg6vvtooAF")
this.actor.createEmbeddedDocuments("Item", [item.toObject()], {fromEffect : this.effect.id})