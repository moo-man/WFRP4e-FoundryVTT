let item = await fromUuid("Compendium.wfrp4e-core.items.vMYEkrWj0ip6ZOdv")
let data = item.toObject();
data.name += " (Disease)"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})