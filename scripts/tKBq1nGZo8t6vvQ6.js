let item = await fromUuid("Compendium.wfrp4e-core.items.5hH73j2NgPdsLCZN");
this.actor.createEmbeddedDocuments("Item", [item.toObject()], {fromEffect : this.effect.id})