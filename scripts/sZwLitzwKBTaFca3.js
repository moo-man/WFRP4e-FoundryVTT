let item = await fromUuid("Compendium.wfrp4e-core.items.Item.5hH73j2NgPdsLCZN")
let data = item.toObject();
data.name = data.name.replace("Target", "Greenskins, Undead, Chaos")
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})