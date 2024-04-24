let item = await fromUuid("Compendium.wfrp4e-core.items.V0c3qBU1CMm8bmsW")
let data = item.toObject()
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
