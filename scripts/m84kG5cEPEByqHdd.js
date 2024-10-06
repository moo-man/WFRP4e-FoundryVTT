const uuid = "Compendium.wfrp4e-core.items.Item.SfUUdOGjdYpr3KSR";
const item = await fromUuid(uuid);
await this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id});