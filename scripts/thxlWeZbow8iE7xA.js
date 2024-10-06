const uuid = "Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn";
const item = await fromUuid(uuid);
const data = item.toObject();
data.system.specification.value = 1;
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id});