let item = await fromUuid("Compendium.wfrp4e-core.items.Item.6l3jvIAvrKxt0lA9");
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})