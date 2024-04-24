let item = await fromUuid("Compendium.wfrp4e-core.items.rOV2s6PQBBrhpMOv")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})