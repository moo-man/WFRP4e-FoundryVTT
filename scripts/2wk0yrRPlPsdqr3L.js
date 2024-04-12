let item = await fromUuid("Compendium.wfrp4e-core.items.9GNpAqgsKzxZKJpp")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})