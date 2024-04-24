let item = await fromUuid("Compendium.wfrp4e-core.items.gz2xy41OSVZ8YBgI");
let data = item.toObject();
data.system.location.key = this.item.system.location.key
this.actor.createEmbeddedDocuments("Item", [data])
