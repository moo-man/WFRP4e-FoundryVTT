let broken = this.actor.hasCondition("broken");
let fatigued = this.actor.hasCondition("fatigued");
await broken?.delete();
await fatigued?.delete()
let drilled = await fromUuid("Compendium.wfrp4e-core.items.Item.J9MK0AIaTbvd5oF6")
let fearless = await fromUuid("Compendium.wfrp4e-core.items.Item.8pVzgPkgWpTJvfhG")
let stout = await fromUuid("Compendium.wfrp4e-core.items.Item.IogM5gnsoOX63w7j")
this.actor.createEmbeddedDocuments("Item", [drilled, fearless, stout], {fromEffect : this.effect.id})