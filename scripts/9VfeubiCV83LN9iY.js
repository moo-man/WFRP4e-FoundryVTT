let item = await fromUuid("Compendium.wfrp4e-core.items.AtpAudHA4ybXVlWM")
let data = item.toObject();
data.name += ` (When Charging)`
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})