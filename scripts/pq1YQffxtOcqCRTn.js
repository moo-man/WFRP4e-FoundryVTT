let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle: ` - ${this.effect.name}`})
await test.roll();
if (!test.succeeded)
{
    this.actor.addCondition("prone")
}