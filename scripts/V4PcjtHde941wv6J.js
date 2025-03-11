await this.actor.addCondition("prone");
const SL = this.effect.sourceTest.result.slOver;
const stunned = 1 + SL;
await this.actor.addCondition("stunned", stunned);

if (stunned > this.actor.system.characteristics.t.bonus) {
  const crit = `<a data-action="clickTable" class="action-link critical" data-table="crithead" data-modifier="0"><i class="fas fa-list"></i> Critical</a>`;
  
  const test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {
    skipTargets: true,
    appendTitle: ` - ${this.effect.name}`,
    fields: {difficulty: "average"},
    context: {failure: `Receives ${crit} to the head.`}
  })
  
  await test.roll();
}