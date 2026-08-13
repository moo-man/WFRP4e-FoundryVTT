await this.actor.addCondition("blinded");

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle: ` - ${this.effect.name}`, skipTargets: true});
await test.roll();

if (test.failed)
{
  await this.actor.addCondition("blinded");
}