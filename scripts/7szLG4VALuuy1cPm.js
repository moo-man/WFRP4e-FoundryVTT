let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "easy"}})
await test.roll();
if (test.failed)
{ 
  await this.actor.addCondition("fatigued")
} 