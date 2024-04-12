let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "average"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();  
if (test.failed)
{
    this.actor.addCondition("prone");
}
  