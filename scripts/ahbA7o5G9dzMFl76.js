let item = await fromUuid("Compendium.wfrp4e-core.items.Item.SfUUdOGjdYpr3KSR")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})