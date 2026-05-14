if (args.equipped)
{ 
  this.script.notification("Frenzied!")
  let frenzy = (await fromUuid("Compendium.wfrp4e-core.items.Item.yRhhOlt18COq4e1q.ActiveEffect.ydTMvbmqv6BZ4u6d")).toObject();
  frenzy.statuses = ["frenzy"];
  frenzy.disabled = false;
  ActiveEffect.implementation.create(frenzy, {parent: this.actor});
}
else 
{
   this.actor.effects.find(e => e.statuses.has("frenzy"))?.delete();
}