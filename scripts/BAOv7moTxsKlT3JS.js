let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "easy"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
    this.actor.addCondition("broken")
}