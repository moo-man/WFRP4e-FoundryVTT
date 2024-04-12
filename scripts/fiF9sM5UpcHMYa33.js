let item = await fromUuid("Compendium.wfrp4e-core.items.vMYEkrWj0ip6ZOdv");
let data = item.toObject();
data.name += " (Poison, Disease, Chaos)"
this.actor.createEmbeddedDocuments("Item", Array(this.effect.sourceTest.result.overcast.usage.other.current).fill(data), {fromEffect: this.effect.id})