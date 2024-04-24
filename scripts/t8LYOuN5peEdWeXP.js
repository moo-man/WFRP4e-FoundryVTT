let item = await fromUuid("Compendium.wfrp4e-core.items.mNoCuaVbFBflfO6X")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})