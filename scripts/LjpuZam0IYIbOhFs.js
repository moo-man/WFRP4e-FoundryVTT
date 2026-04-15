const test = await args.actor.setupSkill(game.i18n.localize("NAME.Navigation"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "vhard"},
  context: {
    failure: "Can't perform an action other than wander in a random direction at normal walking pace.",
    success: "Can act normally."
  }
});

await test.roll();