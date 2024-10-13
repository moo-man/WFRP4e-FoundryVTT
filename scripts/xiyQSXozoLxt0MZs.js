const uuids = [
  "Compendium.wfrp4e-core.items.Item.wMwSRDmgiF2IdCJr",     // Painless
  "Compendium.wfrp4e-core.items.Item.IAWyzDfC286a9MPz",       // Immunity to Psychology
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});