let item = await fromUuid("Compendium.wfrp4e-core.items.uqGxFOEqeurwkAO3")
item = item.toObject()

item.system.specification.value = 10;
item.name += " (Fire)"
setProperty(item, "flags.wfrp4e.breath",  "fire")

Item.create(item, {parent : this.actor, fromEffect: this.effect.id})