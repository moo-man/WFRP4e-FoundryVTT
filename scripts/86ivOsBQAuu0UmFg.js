let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "hard"}, appendTitle : ` - ${this.effect.name}`, skipTargets: true});
await test.roll();
if (test.failed)
{
    this.actor.addCondition("poisoned");
}