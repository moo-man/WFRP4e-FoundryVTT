const uuid = "Compendium.wfrp4e-core.items.Item.JQa5DLnTs2SEzRrc";
const item = await fromUuid(uuid);
await this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id});