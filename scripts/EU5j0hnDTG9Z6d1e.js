let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : ` - ${this.effect.name}`, fields: {difficulty: "hard"}})
await test.roll();
if(test.failed)
{
    this.actor.addCondition("stunned", 2)
}