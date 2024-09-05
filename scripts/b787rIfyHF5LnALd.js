let item = await fromUuid("Compendium.wfrp4e-core.items.Item.HbrwGhUl0ZXz4kLA")
let hardy = item.toObject();

item = await fromUuid("Compendium.wfrp4e-core.items.Item.VUJUZVN3VYhOaPjj")
let armour = item.toObject();
armour.system.specification.value = 1;
this.actor.createEmbeddedDocuments("Item", [armour, hardy], {fromEffect : this.effect.id});