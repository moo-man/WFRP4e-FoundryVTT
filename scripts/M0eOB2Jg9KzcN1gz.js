const uuids = [
  "Compendium.wfrp4e-core.items.Item.Nj3tC8A5fZ3zEdMR",     // Holy Visions
  "Compendium.wfrp4e-core.items.Item.mNoCuaVbFBflfO6X",       // Sixth Sense
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});