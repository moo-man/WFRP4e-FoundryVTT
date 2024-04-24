if (args.equipped)
{
    let item = await fromUuid("Compendium.wfrp4e-core.items.HpFkVJ2lYPAWumUL")
    let data = item.toObject();
    this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
}
else 
{
    this.effect.deleteCreatedItems();   
}