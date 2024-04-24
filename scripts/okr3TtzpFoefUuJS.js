let item = await fromUuid('Compendium.wfrp4e-core.items.EaqlLRQigwnsEAXX')
let data = item.toObject();
data.system.location.value = "Collar Bone"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})