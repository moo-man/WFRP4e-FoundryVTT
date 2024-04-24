let item = await fromUuid("Compendium.wfrp4e-core.items.Item.RWJrupj9seau0w31");
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})