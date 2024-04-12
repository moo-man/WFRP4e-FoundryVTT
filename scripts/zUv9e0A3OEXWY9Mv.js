let item = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
let data = item.toObject();
data.system.specification.value = 9 - this.actor.system.characteristics.s.bonus
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})