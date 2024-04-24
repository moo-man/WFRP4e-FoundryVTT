let item = await fromUuid("Compendium.wfrp4e-core.items.BqPZn6q3VHn9HUrW")
item = item.toObject()
item.name = this.effect.name
item.system.specification.value = this.actor.characteristics.s.bonus
item.system.description.value = ""
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})