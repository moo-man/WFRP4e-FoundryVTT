let item = await fromUuid("Compendium.wfrp4e-core.items.8piWcBKFlQ2J1E3A")
let data = item.toObject();
data.system.location.key= this.item.system.location.key
this.actor.createEmbeddedDocuments("Item", [data])