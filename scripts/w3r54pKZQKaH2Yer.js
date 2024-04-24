let item = await fromUuid("Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn")
let data = item.toObject();
let slOver = this.effect.sourceTest.result.slOver;
let overcast = this.effect.sourceTest.result.overcast
slOver -= ((overcast.total - overcast.available) * 2) // If they used an overcast, subtract 2 SL for each one
let added = Math.floor(slOver / 3) || 0
data.system.specification.value = 1 + added; // For each +3 SL, add 1 specification
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})