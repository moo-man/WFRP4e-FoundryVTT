const uuids = [
  "Compendium.wfrp4e-core.items.Item.bxbTiLzbaz4vdukT",          // Hunter's Eye
  "Compendium.wfrp4e-core.items.Item.XSb3QVB9ipPBFt56",       // Shadow
];

const items = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
await this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id});