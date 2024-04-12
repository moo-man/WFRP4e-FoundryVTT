let item = await fromUuid("Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn");
let data = item.toObject();
data.system.specification.value = 1;
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})