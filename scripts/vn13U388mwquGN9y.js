let item = await fromUuid("Compendium.wfrp4e-core.items.Item.wGTD2LezlI6Atyy0");
let leader = item.toObject();

item = await fromUuid("Compendium.wfrp4e-core.items.Item.u0CFf3xwiyidD9T5");
let luck = item.toObject();
await this.actor.createEmbeddedDocuments("Item", [leader, luck], {fromEffect : this.effect.id});