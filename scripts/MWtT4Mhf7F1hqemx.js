let damage = this.effect.sourceTest.result.damage;

await this.actor.applyDamage(damage, {
  loc: "roll",
  damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP,
  createMessage: this.script.getChatData(),
});

await this.actor.addCondition("ablaze", 2);

const test = await this.actor.setupSkill(
  game.i18n.localize("NAME.Dodge"),
  {
    skipTargets: true,
    appendTitle: ` — ${this.effect.name}`,
  },
);

await test.roll();

if (test.failed) {
  await this.actor.addCondition("prone");
  await this.actor.addCondition("stunned");
}