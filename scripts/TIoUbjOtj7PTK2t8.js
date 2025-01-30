const test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "challenging"},
  context: {
    failure: `Butcher loses teeth.`
  }
});

await test.roll();

if (test.failed) {
  const SL = Number(test.result.SL);
  this.script.message(`Butcher loses ${SL} teeth.`);
}