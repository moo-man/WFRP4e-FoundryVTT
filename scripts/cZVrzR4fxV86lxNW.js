let item = await fromUuid("Compendium.wfrp4e-core.items.Item.yrkI7ATjqLPDTFmZ")
let res = item.toObject();
res.system.specification.value = 1;

item = await fromUuid("Compendium.wfrp4e-core.items.Item.mNoCuaVbFBflfO6X")
let ss = item.toObject();
await this.actor.createEmbeddedDocuments("Item", [res, ss], {fromEffect : this.effect.id})