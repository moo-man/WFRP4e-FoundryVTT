if (args.equipped) 
{
    let item = await fromUuid("Compendium.wfrp4e-core.items.Item.4mF5Sp3t09kZhBYc");
    let champion = item.toObject();
    this.actor.createEmbeddedDocuments("Item", [champion], {fromEffect : this.effect.id})
} 
else 
{
  this.effect.deleteCreatedItems();
}