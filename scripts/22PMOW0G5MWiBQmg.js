let fear = await fromUuid("Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn")
fear = fear.toObject();
fear.system.specification.value = 1;
await this.actor.createEmbeddedDocuments("Item", [fear], {fromEffect : this.effect.id})