let item = await fromUuid("Compendium.wfrp4e-core.items.2iult41Jehz0F1O8")
let data = item.toObject();
data.system.location.key = this.item.system.location.key;
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})