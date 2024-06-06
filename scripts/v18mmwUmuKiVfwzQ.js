let test = await this.actor.setupTest(game.i18n.localize("NAME.Endurance"), {appendTitle : ` - ${this.effect.name}`, skipTargets: true});
await test.roll();
if (test.failed)
{
    this.actor.addCondition("stunned");
}