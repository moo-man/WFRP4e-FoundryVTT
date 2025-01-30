await this.actor.addCondition("prone");

const test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {
  skipTargets: true,
  appendTitle: ` - ${this.effect.name}`,
  fields: {difficulty: "difficult"},
  context: {
    failure: `Receives 8 Damage.`,
    success: `Receives 4 Damage.`
  }
})

await test.roll();
const damage = test.failed ? 8 : 4;

await this.actor.applyBasicDamage(damage, {damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, loc: "roll"});