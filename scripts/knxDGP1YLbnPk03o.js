let test = await this.actor.setupSkill(game.i18n.localize("NAME.Athletics"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
  this.actor.addCondition("prone");
}