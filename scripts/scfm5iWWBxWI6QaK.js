let darkvision = await fromUuid("Compendium.wfrp4e-core.items.Item.JQa5DLnTs2SEzRrc")
let fear = await fromUuid("Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn")
let acutesense = await fromUuid("Compendium.wfrp4e-core.items.Item.9h82z72XGo9tfgQS")
fear = fear.toObject();
fear.system.specification.value = 1;
this.actor.createEmbeddedDocuments("Item", [darkvision, fear, acutesense], {fromEffect : this.effect.id})