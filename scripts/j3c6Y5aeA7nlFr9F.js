const uuids = [
  "Compendium.wfrp4e-core.items.Item.wBhPFggGqIXwbx1r",     // Alley Cat
  "Compendium.wfrp4e-core.items.Item.q58lK4kULJZB5GjE",         // Rover
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});