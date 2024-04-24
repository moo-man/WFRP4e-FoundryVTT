let amount = this.effect.sourceTest.result.overcast.usage.other.current;

let sss = await fromUuid("Compendium.wfrp4e-core.items.MGEPI4jNhymNIRVz");
let strider = await fromUuid("Compendium.wfrp4e-core.items.1dUizIgLBgn4jICC");

let items = Array(amount).fill(sss).concat(Array(amount).fill(strider))

this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id})