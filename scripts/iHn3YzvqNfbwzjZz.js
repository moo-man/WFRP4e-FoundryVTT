let item = await fromUuid("Compendium.wfrp4e-core.items.AtpAudHA4ybXVlWM")
let data = item.toObject();
data.system.specification.value = this.actor.characteristics.s.bonus
data.system.description.value = ""
data.name = this.effect.name;
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})