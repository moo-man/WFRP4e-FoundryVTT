let item = await fromUuid("Compendium.wfrp4e-core.items.uqGxFOEqeurwkAO3")
let data = item.toObject();
foundry.utils.setProperty(data, "flags.wfrp4e.breath", "fire")
data.system.specification.value = 5
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})