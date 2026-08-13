let damage = await new Roll("2d10 + @sin", {sin: this.actor.system.status.sin.value || 0}).roll();
damage.toMessage(this.script.getChatData());
this.actor.applyDamage(damage.total, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL,
  createMessage: this.script.getChatData()
});

const test = await this.actor.setupSkill(
  game.i18n.localize("NAME.Endurance"),
  {
    fields: {difficulty: "hard"},
    skipTargets: true,
    appendTitle: ` — ${this.effect.name}`,
  },
);

await test.roll();
if (test.failed)
{
  if (parseInt(test.result.SL) <= -4)
  {
    this.actor.addCondition("unconscious");
  }
  else 
  {
    this.actor.addCondition("stunned");
  }
}