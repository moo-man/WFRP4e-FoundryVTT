let item = await fromUuid("Compendium.wfrp4e-core.items.nbhn2wX35b7Jrcbg")
let data = item.toObject();
data.system.location.value = "Jaw"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})