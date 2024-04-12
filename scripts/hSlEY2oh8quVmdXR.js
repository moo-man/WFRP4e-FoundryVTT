let item = await fromUuid("Compendium.wfrp4e-core.items.pTorrE0l3VybAbtn")
let data = item.toObject();
data.system.specification.value = 2
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})