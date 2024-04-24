let item = await fromUuid("Compendium.wfrp4e-core.items.7rBhIRo96Mydo0Cv")
let data = item.toObject();
data.system.location.value = "Back"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
