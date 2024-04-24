let item = await fromUuid("Compendium.wfrp4e-core.items.sJ3yX1kvzu2hgNq5")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})