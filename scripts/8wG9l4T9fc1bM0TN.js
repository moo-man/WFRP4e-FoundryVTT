let item = (await fromUuid("Compendium.wfrp4e-core.items.Item.kJNAY1YRaCy9IgmT")).toObject();
item.system.specification.value = 1;
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})