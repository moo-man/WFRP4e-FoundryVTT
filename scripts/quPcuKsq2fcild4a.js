let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields: {difficulty: "easy"}, context: {failure : `<strong>${this.effect.name}</strong>: Vomit!`} })
await test.roll();
if (test.failed)
{
    this.actor.addCondition("prone")
}