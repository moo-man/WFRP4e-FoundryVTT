let items = [];

let etiquette = (await fromUuid("Compendium.wfrp4e-core.items.Item.sYbgpSnRqSZWgwFP")).toObject();
etiquette.name += " (Followers of Khorne)";

items.push(etiquette);

let animosity = (await fromUuid("Compendium.wfrp4e-core.items.Item.Q2MCUrG2HppMcvN0")).toObject();
animosity.name = animosity.name.replace("(Target)", "(Followers of Slaanesh)");

items.push(animosity);

await this.actor.createEmbeddedDocuments("Item", items, {fromEffect : this.effect.id});
