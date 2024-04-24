let item = await fromUuid("Compendium.wfrp4e-core.items.CV9btQn09S9Fn8Jk");
this.actor.createEmbeddedDocuments("Item", [item.toObject()], {fromEffect : this.effect.id});