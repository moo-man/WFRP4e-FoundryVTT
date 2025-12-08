if (this.actor.hasCondition("engaged") && this.effect.disabled)
{
  this.effect.update({"disabled" : false})
  this.item.effects.contents[1].update({"disabled" : false});
  this.script.notification("Enabled")
}
else if (this.effect.active && !this.actor.hasCondition("engaged"))
{
  this.effect.update({"disabled" : true})
  this.item.effects.contents[1].update({"disabled" : true});
  
}