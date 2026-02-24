const excessSL = this.effect.sourceTest.result.baseSL - this.effect.sourceItem.system.sl;
const weapon = this.effect.sourceActor.items.find(i => i.equipped && i.system.tags.has("weapon"));
let damage = weapon?.Damage + 4;
damage += excessSL;
this.actor.applyDamage(damage, {
  loc: "roll",
  createMessage: this.script.getChatData(),
});