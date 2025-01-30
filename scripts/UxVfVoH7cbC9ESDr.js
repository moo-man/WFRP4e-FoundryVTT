const test = await args.actor.setupSkill(game.i18n.localize("NAME.Cool"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "challenging"},
  context: {
    failure: `Gained @Condition[Stunned] Condition.`
  }
});

await test.roll();

if (test.failed)
  args.actor.addCondition("stunned");