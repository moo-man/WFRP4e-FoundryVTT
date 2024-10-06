const uuids = [
  "Compendium.wfrp4e-core.items.Item.77p3QRKgFWakkndF",     // Blather
  "Compendium.wfrp4e-core.items.Item.b4x1qEWcevX7xK58",       // Schemer
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});