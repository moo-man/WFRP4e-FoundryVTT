let item = await fromUuid("Compendium.wfrp4e-core.items.J9MK0AIaTbvd5oF6");
this.actor.createEmbeddedDocuments("Item", [item.toObject()], {fromEffect : this.effect.id});