let item = await fromUuid("Compendium.wfrp4e-core.items.M5QSWOYt2Rbv2yxW")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})