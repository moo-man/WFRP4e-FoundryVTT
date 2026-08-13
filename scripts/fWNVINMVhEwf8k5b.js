this.actor.addCondition("stunned");
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle: ` - ${this.effect.name}`, skipTargets: true, fields: {difficulty: "vhard"}});

await test.roll();

if (test.failed)
{
  this.actor.addCondition("prone");
}