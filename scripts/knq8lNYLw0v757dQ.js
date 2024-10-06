let item = await fromUuid("Compendium.wfrp4e-core.items.Item.9fq6p9Q6H02LjaSi")
let data = item.toObject();
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id});