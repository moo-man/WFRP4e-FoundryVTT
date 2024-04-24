let item = await fromUuid("Compendium.wfrp4e-core.items.SfUUdOGjdYpr3KSR")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})