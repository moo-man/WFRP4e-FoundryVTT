let tooth = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
tooth = tooth.toObject()
tooth.system.specification.value = 3
tooth.system.qualities.value = [{name : "magical"}]
 
let claw = await fromUuid("Compendium.wfrp4e-core.items.AtpAudHA4ybXVlWM")
claw = claw.toObject()
claw.system.specification.value = 4
claw.system.qualities.value = [{name : "magical"}]
claw.name = "Claw"

this.actor.createEmbeddedDocuments("Item", [tooth, claw], {fromEffect : this.effect.id})