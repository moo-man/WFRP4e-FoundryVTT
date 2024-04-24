let item = await fromUuid("Compendium.wfrp4e-core.items.klCJX0mNpXYH5AIx")
let data = item.toObject();   
data.name = data.name.replace("Target", "Strangers");
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id});