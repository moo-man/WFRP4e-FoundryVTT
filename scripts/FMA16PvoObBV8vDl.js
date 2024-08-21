let item = await fromUuid("Compendium.wfrp4e-core.items.EO05HX7jql0g605A")
item = item.toObject()
item.system.specification.value = 20
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})
this.script.notification(item.name + " added")