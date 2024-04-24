if (args.equipped)
{
    let ward = await fromUuid("Compendium.wfrp4e-core.items.Bvd2aZ0gQUXHfCTh")
    wardData = ward.toObject()
    wardData.system.specification.value = "8"
     
    let mr = await fromUuid("Compendium.wfrp4e-core.items.yrkI7ATjqLPDTFmZ")
    mrData = mr.toObject()
    mrData.system.specification.value = 2
    
    this.actor.createEmbeddedDocuments("Item", [wardData, mrData], {fromEffect : this.effect.id})
}
else
{
    this.effect.deleteCreatedItems()
}