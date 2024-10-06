let item = await fromUuid("Compendium.wfrp4e-core.items.Item.8pVzgPkgWpTJvfhG")
let data = item.toObject();
data.name = `${data.name} (Undead, Warm-bloods)`;
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})