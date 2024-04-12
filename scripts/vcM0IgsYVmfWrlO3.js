fromUuid("Compendium.wfrp4e-core.items.rOV2s6PQBBrhpMOv").then(item => {
    this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id});
})