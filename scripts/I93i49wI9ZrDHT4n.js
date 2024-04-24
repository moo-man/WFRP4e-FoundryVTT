let item = await fromUuid("Compendium.wfrp4e-core.items.Item.jt0DmVK9IiF6Sd2h");
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})