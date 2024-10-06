let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {difficulty: "hard"})
await test.roll();
if (!test.succeeded)
{
    await this.actor.addCondition("unconscious");
}