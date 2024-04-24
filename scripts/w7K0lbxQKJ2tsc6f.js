let item = await fromUuid("Compendium.wfrp4e-core.items.EO05HX7jql0g605A")
let data = item.toObject();
data.system.specification.value = 60
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})