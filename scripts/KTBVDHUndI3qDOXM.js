let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"))
await test.roll();
if (!test.succeeded)
{
    args.actor.addCondition("stunned")
}