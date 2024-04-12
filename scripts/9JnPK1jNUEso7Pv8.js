let item = await fromUuid("Compendium.wfrp4e-core.items.9h82z72XGo9tfgQS")
let data = item.toObject();
data.name += ` (Smell)`
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})