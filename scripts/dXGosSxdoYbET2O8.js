await this.actor.addCondition("fatigued");

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"))

await test.roll();

if (!test.succeeded)
{
    await this.actor.addCondition("fatigued");
    await this.actor.addCondition("broken");
}