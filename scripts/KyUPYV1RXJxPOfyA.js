let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : ` - ${this.effect.name}`, fields : {difficulty : "veasy"}})
await test.roll();
if (test.failed)
{
    this.actor.addCondition("fatigued");
}