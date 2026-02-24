let damage = this.effect.sourceTest.result.damage;

damage += 7; // goes from +8 to +15;

if (this.actor.sizeNum >= game.wfrp4e.config.actorSizeNums.lrg)
  damage += 22; // goes from +15 to +30;

if (this.actor.has(game.i18n.localize("NAME.Unstable"))) 
  damage *= 2;

this.actor.applyDamage(damage, {
  loc: "roll",
  createMessage: this.script.getChatData()
});