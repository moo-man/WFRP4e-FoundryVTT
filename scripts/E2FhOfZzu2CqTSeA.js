let damage = this.effect.sourceTest.result.damage;

await this.actor.applyDamage(damage - 3, {
  loc: "roll",
  damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP,
  createMessage: this.script.getChatData(),
});

await this.actor.addCondition("ablaze", 1);