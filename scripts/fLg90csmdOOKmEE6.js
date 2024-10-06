let item = await fromUuid("Compendium.wfrp4e-core.items.Item.EO05HX7jql0g605A")
let data = item.toObject();
data.system.specification.value = 16
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})

let item = await fromUuid("Compendium.wfrp4e-core.items.Item.Bvd2aZ0gQUXHfCTh")
let data = item.toObject();
data.system.specification.value = 8
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})