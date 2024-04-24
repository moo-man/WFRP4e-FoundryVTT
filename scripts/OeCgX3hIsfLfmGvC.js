let test = await this.actor.setupSkill(game.i18n.localize("NAME.Perception"))
await test.roll();
if (test.succeeded)
{
    this.actor.removeCondition("surprised");
}