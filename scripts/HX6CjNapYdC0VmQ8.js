let item = await fromUuid("Compendium.wfrp4e-core.items.epPBu7x6BRWp2PHG")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})