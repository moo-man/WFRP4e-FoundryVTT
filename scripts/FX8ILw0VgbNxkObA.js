const uuid = "Compendium.wfrp4e-core.items.Item.mCvZAj5F6hfUZhzR";
const item = await fromUuid(uuid);
const data = item.toObject();
data.name = this.effect.name;
data.type = 'trapping';
data.system.trappingType = {value: 'clothingAccessories'};
data.system.equipped = {value: true};

const effectData = this.effect.sourceItem.effects.find(e => e.disabled).toObject();
effectData.disabled = false;
effectData.system.transferData.equipTransfer = true;
data.effects = [effectData];

const dagger = await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id});