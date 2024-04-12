let item = await fromUuid("Compendium.wfrp4e-core.items.Item.9h82z72XGo9tfgQS")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})