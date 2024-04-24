let item = await fromUuid("Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})