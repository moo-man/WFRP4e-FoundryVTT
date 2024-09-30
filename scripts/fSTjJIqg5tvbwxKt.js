const uuid = "Compendium.wfrp4e-core.items.Item.ahlxlfIl8xUhBkic";
const item = await fromUuid(uuid);
const data = item.toObject();
data.name = this.effect.name;
data.system.equipped.value = true;

const effectData = this.effect.sourceItem.effects.find(e => e.disabled).toObject();
effectData.disabled = false;
data.effects = [effectData];

const dagger = await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id});