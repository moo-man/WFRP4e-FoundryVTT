let item = await fromUuid("Compendium.wfrp4e-core.items.4CMKeDTDrRQZbPIJ")
let fixation = (await game.wfrp4e.tables.rollTable("fixations"))
let data = item.toObject();
data.system.specification.value = fixation.result;
this.item.updateSource({name : this.item.name += ` (${fixation.result})`});
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})