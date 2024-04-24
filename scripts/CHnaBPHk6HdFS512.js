let arm = await fromUuid("Compendium.wfrp4e-core.items.MnMZv7ZXoRqoH9dS");
let leg = await fromUuid("Compendium.wfrp4e-core.items.k00PimCWkff11IA0");

let choice = await ItemDialog.create([arm, leg], 1, "Choose Limb")

this.actor.createEmbeddedDocuments("Item", choice, {fromEffect: this.effect.id})