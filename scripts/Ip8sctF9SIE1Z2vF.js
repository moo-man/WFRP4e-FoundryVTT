let item = await fromUuid("Compendium.wfrp4e-core.items.UnJ25lL8aUzem5JO")
let data = item.toObject();
data.system.specification.value = 3
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})