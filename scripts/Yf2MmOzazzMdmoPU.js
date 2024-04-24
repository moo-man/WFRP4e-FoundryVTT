let armour = await fromUuid("Compendium.wfrp4e-core.items.VUJUZVN3VYhOaPjj")
let armourData = armour.toObject()
armourData.system.specification.value = 1
 
let fury = await fromUuid("Compendium.wfrp4e-core.items.fjd1u9VAgiYzhBRp");
let furyData = fury.toObject();

let horns = await fromUuid("Compendium.wfrp4e-core.items.BqPZn6q3VHn9HUrW")
let hornsData = horns.toObject()
hornsData.system.specification.value = 6

this.actor.createEmbeddedDocuments("Item", [armourData, furyData, hornsData], {fromEffect : this.effect.id})