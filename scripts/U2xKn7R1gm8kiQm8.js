this.actor.hasCondition("broken")?.delete();

let item = await fromUuid("Compendium.wfrp4e-core.items.Item.8pVzgPkgWpTJvfhG")
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})