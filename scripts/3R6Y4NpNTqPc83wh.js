let item = await fromUuid("Compendium.wfrp4e-core.items.IPKRMGry6WotuS1G")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})