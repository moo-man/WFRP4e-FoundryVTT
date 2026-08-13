let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "hard"}, context : {failure: "Gain Broken"}});
await test.roll();
if (test.failed)
{
    this.actor.addCondition("broken");
}