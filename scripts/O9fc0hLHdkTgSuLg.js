let bite = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
let venom = await fromUuid("Compendium.wfrp4e-core.items.gFkRm9wS65qe18Xv")
let biteData = bite.toObject();
let venomData = venom.toObject();

biteData.system.specification.value = 3 - this.actor.characteristics.s.bonus;
venomData.system.specification.value = "Average"
this.actor.createEmbeddedDocuments("Item", [biteData, venomData], {fromEffect : this.effect.id})