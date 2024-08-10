let item = await fromUuid("Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn")
let data = item.toObject();
let value = foundry.utils.getProperty(this.effect.sourceTest, "result.overcast.usage.other.current") || 1
data.system.specification.value = value
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})