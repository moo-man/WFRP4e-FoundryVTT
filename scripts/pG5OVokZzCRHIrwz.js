let item = await fromUuid("Compendium.wfrp4e-core.items.mgeiaDZXei7JBEgo")
let data = item.toObject();
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})