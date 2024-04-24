let item = await fromUuid("Compendium.wfrp4e-core.items.Item.JQa5DLnTs2SEzRrc")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})