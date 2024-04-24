let item = await fromUuid("Compendium.wfrp4e-core.items.4xF7M6ylIiGntekh")
item = item.toObject()
item.name = this.effect.name
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})
