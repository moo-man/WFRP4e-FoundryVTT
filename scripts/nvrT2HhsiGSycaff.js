const excessSL = this.effect.sourceTest.result.baseSL - this.effect.sourceItem.system.sl;
let damage = 10;
damage += excessSL;
await this.actor.applyDamage(damage, {
  damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP,
  loc: "roll",
  createMessage: this.script.getChatData(),
});
await this.actor.addCondition('deafened', 2);