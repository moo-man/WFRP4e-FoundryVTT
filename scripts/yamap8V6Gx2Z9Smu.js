const uuids = [
  "Compendium.wfrp4e-core.items.Item.nWLsoWQBCjPRKxYx",     // Robust
  "Compendium.wfrp4e-core.items.Item.jviOQmy0luQOySC2",         // Tenacious
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});