let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "difficult"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (!test.succeeded)
{
    await this.actor.addCondition("bleeding");
}