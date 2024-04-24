let infected = await fromUuid("Compendium.wfrp4e-core.items.V0c3qBU1CMm8bmsW")
let bite = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
let biteData = bite.toObject();
let infectedData = infected.toObject();

biteData.system.specification.value = 4 - this.actor.characteristics.s.bonus

this.actor.createEmbeddedDocuments("Item", [biteData, infectedData], {fromEffect : this.effect.id})