const uuids = [
  "Compendium.wfrp4e-core.items.Item.AcnFuDKRemLI9ey7",     // Nose for Trouble
  "Compendium.wfrp4e-core.items.Item.WoXShzaYkV5F6c48",         // Master of Disguise
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});