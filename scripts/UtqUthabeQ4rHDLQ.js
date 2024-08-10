let item = await fromUuid("Compendium.wfrp4e-core.items.Item.tNWrJUOArwfWXsPw");
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id});