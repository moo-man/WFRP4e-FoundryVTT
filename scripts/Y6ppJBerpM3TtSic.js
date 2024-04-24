let item = await fromUuid("Compendium.wfrp4e-core.items.g4Q6AtzZuo5iIvD4");
this.actor.createEmbeddedDocuments("Item", [item.toObject()], {fromEffect : this.effect.id});