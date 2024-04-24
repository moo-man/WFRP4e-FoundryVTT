let item = await fromUuid("Compendium.wfrp4e-core.items.GlShFJF2TpsNh1FX");
let data = item.toObject();
data.system.location.key = this.item.system.location.key
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
