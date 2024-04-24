let item = await fromUuid("Compendium.wfrp4e-core.items.xneBqGOs1QS7kfUr")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})