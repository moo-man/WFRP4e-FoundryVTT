let item = await fromUuid("Compendium.wfrp4e-core.items.yRhhOlt18COq4e1q")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})