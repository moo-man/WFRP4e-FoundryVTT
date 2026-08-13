this.actor.applyDamage(1 + this.actor.system.status.sin?.value || 0, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL,
  createMessage: this.script.getChatData()
});

const test = await this.actor.setupSkill(
  game.i18n.localize("NAME.Endurance"),
  {
    fields: {difficulty: "average"},
    skipTargets: true,
    appendTitle: ` — ${this.effect.name}`,
  },
);

await test.roll();
if (test.failed)
{
  this.actor.addCondition("stunned");
}