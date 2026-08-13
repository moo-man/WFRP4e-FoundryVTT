let melee = ["Compendium.wfrp4e-core.items.Item.4MJJCiOKPkBByYwW", "Compendium.wfrp4e-core.items.Item.RWJrupj9seau0w31", "Compendium.wfrp4e-core.items.Item.jt0DmVK9IiF6Sd2h"];
let ranged = ["Compendium.wfrp4e-core.items.Item.5eDd6iFeR9G6cCfz", "Compendium.wfrp4e-core.items.Item.jrYW2OyDHd1Md2my", "Compendium.wfrp4e-core.items.Item.cygaI9gq4BQJvbB5"];

if (args.equipped)
{
  if (this.item.system.isMelee)
  {
    this.actor.addEffectItems(melee, this.effect);
  }
  else
  {
    this.actor.addEffectItems(ranged, this.effect);
  }
}
else 
{
  this.effect.deleteCreatedItems();
}