let bite = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
let sense = await fromUuid("Compendium.wfrp4e-core.items.9h82z72XGo9tfgQS")
let biteData = bite.toObject();
let senseData = sense.toObject();

biteData.system.specification.value = 6 - this.actor.characteristics.s.bonus;
senseData.name = senseData.name += game.i18n.localize("SPEC.Smell")
this.actor.createEmbeddedDocuments("Item", [biteData, senseData], {fromEffect : this.effect.id})