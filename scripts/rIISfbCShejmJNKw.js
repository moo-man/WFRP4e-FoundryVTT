let item = await fromUuid("Compendium.wfrp4e-core.items.oRx92ByVNEBN6YkK")
let data = item.toObject()
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
