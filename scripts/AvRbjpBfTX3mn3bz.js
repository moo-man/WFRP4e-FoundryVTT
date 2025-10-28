if (this.actor.effects.contents.filter(e => e.name === "Liquid Fortification").length === 0) {
  let effectData = this.item.effects.contents[0].convertToApplied();
  effectData.duration.seconds = 3600
  this.actor.applyEffect({effectData : [effectData]});
  this.script.notification("Set Liquid Fortification effect duration to 1 hour.");
} 
else {
  let effect = this.actor.effects.contents.filter(e => e.name === "Liquid Fortification")[0];
  effect.update({duration: {seconds: 3600}});
  this.script.notification("Reset Liquid Fortification effect duration to 1 hour.");
}