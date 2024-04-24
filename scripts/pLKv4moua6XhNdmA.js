let item = await fromUuid("Compendium.wfrp4e-core.items.1dUizIgLBgn4jICC");
let data = item.toObject();
data.name += " (Woodlands)";
this.actor.createEmbeddedDocuments("Item", Array(this.effect.sourceTest.result.overcast.usage.other.current).fill(data), {fromEffect : this.effect.id})