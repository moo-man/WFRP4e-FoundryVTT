let item = await fromUuid("Compendium.wfrp4e-core.items.MVI0lXcg6vvtooAF")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})