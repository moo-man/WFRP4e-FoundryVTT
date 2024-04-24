let item = await fromUuid("Compendium.wfrp4e-core.items.BqPZn6q3VHn9HUrW")
let data = item.toObject();
data.system.specification.value = 7 - this.actor.characteristics.s.bonus
data.name = item.name.replace("(Feature)", "");
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})