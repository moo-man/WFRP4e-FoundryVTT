let test = await this.actor.setupSkill(game.i18n.localize("NAME.Pray"), {appendTitle: ` - ${this.effect.name}`});
await test.roll();

if (test.succeeded)
{
  this.actor.removeCondition("blinded", 1 + parseInt(test.result.SL));
}