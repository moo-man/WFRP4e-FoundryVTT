let item1 = await fromUuid("Compendium.wfrp4e-core.items.3S4OYOZLauXctmev")
let item2 = await fromUuid("Compendium.wfrp4e-core.items.7mCcI3q7hgWcmbBU")

let data1 = item1.toObject();
data1.system.location.key = this.item.system.location.key

let data2 = item2.toObject();
data2.system.location.key = this.item.system.location.key

this.actor.createEmbeddedDocuments("Item", [data1, data2], {fromEffect: this.effect.id})
