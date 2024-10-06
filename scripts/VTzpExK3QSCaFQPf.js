if (args.equipped) 
{
    let item = await fromUuid("Compendium.wfrp4e-core.items.Item.SfUUdOGjdYpr3KSR")
    let regen = item.toObject();
    item = await fromUuid("Compendium.wfrp4e-core.items.Item.kJNAY1YRaCy9IgmT");
    let terror = item.toObject();
    terror.system.specification.value = 2;
    this.actor.createEmbeddedDocuments("Item", [regen, terror], {fromEffect : this.effect.id});
} 
else 
{
  this.effect.deleteCreatedItems();
}