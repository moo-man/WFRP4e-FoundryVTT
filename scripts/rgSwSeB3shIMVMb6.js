let item = await fromUuid("Compendium.wfrp4e-core.items.x0WMGwuQzReXcQrs")
let data = item.toObject();    
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id});