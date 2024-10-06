if (args.totalWoundLoss > 0) {
  let frenzy = await fromUuid("Compendium.wfrp4e-core.items.Item.DrNUTPeodEgpWTnT");
  frenzy = frenzy.toObject(); 
  frenzy.effects[0].disabled = false;
  this.actor.createEmbeddedDocuments("Item", [frenzy], {fromEffect : this.effect.id}); 
  this.script.scriptMessage("Carnosaur gains Frenzy");
}