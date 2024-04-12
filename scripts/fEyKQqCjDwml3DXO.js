let item = await fromUuid("Compendium.wfrp4e-core.items.M8XyRs9DN12XsFTQ")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})