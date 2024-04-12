let item = await fromUuid("Compendium.wfrp4e-core.items.GRRN3XAKIpEVCY7z")
let data = item.toObject();
data.name += " (To Be Determined)"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})