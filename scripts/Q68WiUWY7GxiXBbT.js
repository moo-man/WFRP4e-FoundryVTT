let item = await fromUuid("Compendium.wfrp4e-core.items.9GNpAqgsKzxZKJpp")
let data = item.toObject();
data.system.specification.value = "When Alone";
data.effects[0].disabled = true;
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})