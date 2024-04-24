let item = await fromUuid("Compendium.wfrp4e-core.items.Q2MCUrG2HppMcvN0")
item = item.toObject()
let species = args.actor.Species || "Human"
item.name = `Animosity (all not ${species})`
this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})