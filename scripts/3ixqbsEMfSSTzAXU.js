const test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {
  difficulty: "challenging",
  context: {
    failure: "Suffered @Condition[Fatigued] because of nightmares.",
    success: "Suffered nightmares, but slept well enough."
  }
});
await test.roll();

if (test.failed) {
  await this.actor.addCondition("fatigued");
}