if (this.item.system.protects[args.loc] && (args.sourceItem?.system.isMagical || args.sourceItem?.type == "trait"))
{
  const heatBased = await foundry.applications.api.DialogV2.confirm({window : {title : this.effect.name}, content : "Apply protection from heat-based attacks?"})

  if (heatBased) 
  {
    args.applyAP = true;
    args.modifiers.other.push({label : this.effect.name, value : -1 * this.item.system.currentAP[args.loc], details : this.item.name});
  }
}