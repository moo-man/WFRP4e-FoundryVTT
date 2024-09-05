let item = await fromUuid("Compendium.wfrp4e-core.items.Item.JQa5DLnTs2SEzRrc")
let dv = item.toObject();

item = await fromUuid("Compendium.wfrp4e-core.items.Item.OzwDT6kzoLYeeR2d")
let stealthy = item.toObject();

item = await fromUuid("Compendium.wfrp4e-core.items.Item.XSb3QVB9ipPBFt56")
let shadow = item.toObject();
this.actor.createEmbeddedDocuments("Item", [dv, stealthy, shadow], {fromEffect : this.effect.id});