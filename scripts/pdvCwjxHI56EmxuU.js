let item = await fromUuid("Compendium.wfrp4e-core.items.Item.sJ3yX1kvzu2hgNq5")
let amphibious = item.toObject();

item = await fromUuid("Compendium.wfrp4e-core.items.Item.9h82z72XGo9tfgQS")
let as = item.toObject();
as.name += " (Sight)";
await this.actor.createEmbeddedDocuments("Item", [amphibious, as], {fromEffect : this.effect.id})