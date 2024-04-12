let item = await fromUuid("Compendium.wfrp4e-core.items.qn4ZpvTQIX4rcJDl")
let data = item.toObject();
data.system.location.key = this.item.system.location.key
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})