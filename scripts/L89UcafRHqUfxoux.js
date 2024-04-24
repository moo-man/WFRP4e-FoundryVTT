let injury = await fromUuid("Compendium.wfrp4e-core.items.3S4OYOZLauXctmev")
injury.updateSource({"system.location.key" : this.item.system.location.key})
this.actor.createEmbeddedDocuments("Item", [injury], {fromEffect: this.effect.id})