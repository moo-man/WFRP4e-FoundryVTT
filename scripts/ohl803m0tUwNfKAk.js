let item = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
let data = item.toObject();
data.system.specification.value = 5 - this.actor.characteristics.s.bonus
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})