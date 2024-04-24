let item = await fromUuid("Compendium.wfrp4e-core.items.Item.4MJJCiOKPkBByYwW");
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})