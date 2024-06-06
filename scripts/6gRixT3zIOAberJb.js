const disease = await fromUuid("Compendium.wfrp4e-soc.items.Item.8Q9JYtR1y3B5J6UH");
const data = disease.toObject();
data.system.incubation.value = 0;
data.system.duration.active = true;
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id});