let item = await fromUuid("Compendium.wfrp4e-core.items.Item.tXKX29QZBdHmyMc7")
let data = item.toObject();
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})