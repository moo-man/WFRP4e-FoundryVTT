fromUuid("Compendium.wfrp4e-core.items.IAWyzDfC286a9MPz").then(item => {
   item = item.toObject()
   this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})
})