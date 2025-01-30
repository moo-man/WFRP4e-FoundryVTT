const SL = this.effect.sourceTest.result.SL;
const damage = 8 + SL;

await this.actor.applyBasicDamage(damage, {loc: "roll"});

const test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
  skipTargets: true,
  appendTitle: ` - ${this.effect.name}`,
  fields: {difficulty: "challenging"},
  context: {
    failure: `Receives @Condition[Ablaze] Condition.`
  }
})

await test.roll();
if (test.failed) {
  await this.actor.addCondition("ablaze");
}