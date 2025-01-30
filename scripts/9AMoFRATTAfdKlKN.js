const test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "challenging"},
  context: {
    failure: `Received @Condition[Poisoned] Condition.`
  }
});

await test.roll();

if (test.failed) {
  args.actor.addCondition("poisoned");
  const speaker = ChatMessage.getSpeaker({actor: args.actor});
  this.script.message(`<p>${speaker.alias} received 1 @Condition[Poisoned] Condition from Spider Venom.</p><p>Targets reduced to 0 wounds while suffering a @Condition[Poisoned] condition from these arrows become @Condition[Unconcious], but are not at risk of death from any remaining @Condition[Poisoned] conditions as would normally be the case.</p>`);
}