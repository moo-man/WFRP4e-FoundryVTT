let test = await this.actor.setupSkill(game.i18n.localize("NAME.Perception"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "easy"}});
await test.roll();

if (test.succeeded)
{
    this.actor.addCondition("stunned")   
}
else if (test.failed)
{
    this.actor.addCondition("poisoned", 2);
}