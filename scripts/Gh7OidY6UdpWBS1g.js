let item = await fromUuid("Compendium.wfrp4e-core.items.KII1gWnxIZ8HzmU5")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})