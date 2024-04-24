let item = await fromUuid("Compendium.wfrp4e-core.items.QluSTTTq3viHJJUh")
let data = item.toObject();
data.system.location.value = "Ribs";
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})