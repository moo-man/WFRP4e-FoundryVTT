let item = await fromUuid("Compendium.wfrp4e-core.items.qdMbxW09FUoYBzmB")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})