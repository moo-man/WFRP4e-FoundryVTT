const excessSL = this.effect.sourceTest.result.baseSL - this.effect.sourceItem.system.sl;
const weapon = this.effect.sourceActor.items.find(i => i.equipped && i.system.tags.has("weapon"));
let damage = weapon.Damage;
damage += excessSL;
this.actor.applyDamage(damage, {
  loc: "roll",
  weaponProperties: {qualities: {penetrating: true}},
  createMessage: this.script.getChatData(),
});