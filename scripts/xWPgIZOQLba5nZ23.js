let nbFatigue = 1 + Number(this.effect.sourceTest.result.SL);
this.actor.addCondition("fatigued", nbFatigue);  

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "hard"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();

if (test.succeeded)
{
  this.script.notification(this.actor.name + "resisted !")
}
else if (test.failed)
{
  this.actor.addCondition("unconscious", 1);
}