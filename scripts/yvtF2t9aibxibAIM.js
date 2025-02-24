const test = await this.actor.setupSkill(game.i18n.localize("NAME.Perception"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "challenging"},
  context: {
    failure: `Gained @Condition[Prone] Condition.`,
    success: `Able to move.`
  }
});

await test.roll();

if (test.failed)
  this.actor.addCondition("prone");